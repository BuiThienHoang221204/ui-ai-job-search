"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Fire, Microphone, PaperPlaneTilt } from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/dashboard/dash-section";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { cn } from "@/utils";
import { useDashboard } from "./use-dashboard";

const GOALS = [
  { key: "documents", label: "Tạo CV / thư xin việc", icon: FileText },
  { key: "applied", label: "Ứng tuyển", icon: PaperPlaneTilt },
  { key: "interviews", label: "Luyện phỏng vấn", icon: Microphone },
] as const;

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Hôm nay là ngày thứ mấy trong tuần (0 = thứ Hai), theo giờ Việt Nam như backend. */
const todayIndex = () => {
  const name = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(name);
};

/** Cột phải trang Tổng quan: mục tiêu tuần kèm chuỗi ngày hoạt động, rồi các kỹ năng nên học tiếp. */
export function ProgressPanel() {
  const { data } = useDashboard();
  if (!data) return null;

  const done = GOALS.reduce((sum, goal) => sum + Math.min(data.weekly[goal.key].done, data.weekly[goal.key].goal), 0);
  const total = GOALS.reduce((sum, goal) => sum + data.weekly[goal.key].goal, 0);
  const today = todayIndex();
  const { days, week } = data.streak;
  const hint = week[today]
    ? "Hôm nay bạn đã giữ chuỗi"
    : days
      ? "Làm một việc hôm nay để giữ chuỗi"
      : "Tạo CV, nộp đơn hoặc luyện phỏng vấn để bắt đầu";

  return (
    <Card className="flex flex-col divide-y divide-slate-100">
      <DashSection title="Mục tiêu tuần này" icon={Fire}>
        <div className="mb-4 flex items-center gap-4">
          <ProgressCircle value={(done / total) * 100} size={76} strokeWidth={8} strokeClassName="stroke-primary-600">
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {done}/{total}
            </span>
          </ProgressCircle>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <Fire className="size-4" />
              {days ? `${days} ngày liên tiếp` : "Chưa có chuỗi ngày"}
            </p>
            <p className="text-xs text-slate-500">{hint}</p>
            <div className="mt-2 flex gap-1">
              {week.map((active, index) => (
                <span key={WEEKDAYS[index]} className="grid w-5 justify-items-center gap-0.5">
                  <span className={cn("h-1.5 w-5 rounded-full", active ? "bg-amber-500" : "bg-slate-200")} />
                  <span
                    className={cn(
                      "text-[9px] leading-none",
                      index === today ? "font-bold text-slate-900" : "text-slate-400",
                    )}
                  >
                    {WEEKDAYS[index]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ul className="grid gap-3">
          {GOALS.map((goal) => {
            const { done: count, goal: target } = data.weekly[goal.key];
            const GoalIcon = goal.icon;
            return (
              <li key={goal.key} className="grid grid-cols-[1.875rem_minmax(0,1fr)_auto] items-center gap-2.5">
                <span className="flex size-7.5 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <GoalIcon className="size-4" />
                </span>
                <span className="text-sm text-slate-700">
                  {goal.label}
                  <Progress value={(count / target) * 100} className="mt-1 h-1.5" />
                </span>
                <span className="text-sm font-semibold text-slate-700 tabular-nums">
                  {count}/{target}
                </span>
              </li>
            );
          })}
        </ul>
      </DashSection>

      <DashSection
        title="Kỹ năng nên học tiếp"
        icon={BookOpen}
        className="flex-1"
        action={
          <Link href="/dashboard/upskill" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
            Lộ trình
          </Link>
        }
      >
        {data.skillGaps.length === 0 ? (
          <p className="text-sm text-slate-500">Hồ sơ đã có đủ các kỹ năng mà tin trong ngành hay yêu cầu.</p>
        ) : (
          <ul>
            {data.skillGaps.map((gap) => (
              <li key={gap.skill} className="border-t border-slate-100 first:border-t-0">
                <Link
                  href="/dashboard/upskill"
                  className="group grid grid-cols-[1.875rem_minmax(0,1fr)_auto] items-center gap-2.5 py-2.5"
                >
                  <span className="flex size-7.5 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <BookOpen className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-primary-600">
                      {gap.skill}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {gap.jobCount} tin trong ngành yêu cầu
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-primary-600" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashSection>
    </Card>
  );
}
