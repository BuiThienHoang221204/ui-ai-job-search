"use client";

import { FileText, Fire, Microphone, PaperPlaneTilt } from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/ui/dash-section";
import { MeterRow } from "@/components/ui/meter-row";
import { useDashboard } from "@/hooks/use-dashboard";
import { cn } from "@/lib/cn";
import { weekdayIndex } from "@/lib/date";

const GOALS = [
  { key: "documents", label: "Tạo CV / thư xin việc", icon: FileText },
  { key: "applied", label: "Ứng tuyển", icon: PaperPlaneTilt },
  { key: "interviews", label: "Luyện phỏng vấn", icon: Microphone },
] as const;

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Mục tiêu tuần: chuỗi ngày hoạt động và tiến độ ba việc trong tuần. */
export function WeeklyGoals() {
  const { data } = useDashboard();
  if (!data) return null;

  const done = GOALS.reduce((sum, goal) => sum + Math.min(data.weekly[goal.key].done, data.weekly[goal.key].goal), 0);
  const total = GOALS.reduce((sum, goal) => sum + data.weekly[goal.key].goal, 0);
  const today = weekdayIndex(new Date());
  const { days, week } = data.streak;
  let hint = "Tạo CV, nộp đơn hoặc luyện phỏng vấn để bắt đầu";
  if (week[today]) hint = "Hôm nay bạn đã giữ chuỗi";
  else if (days) hint = "Làm một việc hôm nay để giữ chuỗi";

  return (
    <DashSection
      title="Mục tiêu tuần này"
      action={<span className="text-xs text-slate-600 tabular-nums">{done}/{total} việc</span>}
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
        <Fire weight="fill" className="size-4 text-amber-600" />
        {days ? `${days} ngày liên tiếp` : "Chưa có chuỗi ngày"}
      </p>
      <p className="mt-0.5 text-xs text-slate-600">{hint}</p>
      <div className="mt-2 flex gap-1">
        {week.map((active, index) => (
          <span key={WEEKDAYS[index]} className="grid w-6 justify-items-center gap-1">
            <span className={cn("h-1.5 w-6 rounded-full", active ? "bg-amber-500" : "bg-slate-200")} />
            <span className={cn("text-2xs leading-none", index === today ? "font-bold text-slate-900" : "text-slate-500")}>
              {WEEKDAYS[index]}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {GOALS.map((goal) => {
          const { done: count, goal: target } = data.weekly[goal.key];
          const GoalIcon = goal.icon;
          return (
            <MeterRow
              key={goal.key}
              label={
                <>
                  <GoalIcon className="size-4 text-slate-500" />
                  {goal.label}
                </>
              }
              value={`${count}/${target}`}
              percent={(count / target) * 100}
            />
          );
        })}
      </div>
    </DashSection>
  );
}
