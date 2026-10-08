"use client";

import Link from "next/link";
import { Briefcase, FileText, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { DashboardOverview } from "@/types";
import { useSession } from "@/components/dashboard/session";
import { Card } from "@/components/ui/card";
import { Stepper, type Step } from "@/components/ui/stepper";
import { useDashboard } from "./use-dashboard";

/** Năm chặng của hành trình tìm việc và chặng đang làm (chặng đầu tiên chưa xong). */
function journeySteps(data: DashboardOverview): { steps: Step[]; current: number } {
  const avg = data.averageMatchScore === null ? "" : ` · TB ${data.averageMatchScore} điểm`;
  const items = [
    { label: "Hồ sơ", description: `Hoàn thiện ${data.profileCompletion}%`, done: data.profileCompletion >= 80 },
    { label: "Chấm điểm việc", description: `${data.totalScored} tin${avg}`, done: data.totalScored >= 3 },
    { label: "Tối ưu CV", description: `${data.journey.cvs} CV đã tạo`, done: data.journey.cvs > 0 },
    { label: "Ứng tuyển", description: `${data.journey.applied} đơn đã nộp`, done: data.journey.applied > 0 },
    { label: "Phỏng vấn", description: `${data.journey.interviews} buổi luyện`, done: data.journey.interviews > 0 },
  ];
  const firstTodo = items.findIndex((item) => !item.done);
  return { steps: items, current: firstTodo === -1 ? items.length : firstTodo };
}

/** Hình minh hoạ "con đường lên đỉnh núi" cho hành trình tìm việc. */
function JourneyIllustration() {
  return (
    <svg width="240" height="150" viewBox="0 0 240 150" aria-hidden className="hidden shrink-0 md:block">
      <circle cx="196" cy="34" r="16" className="fill-amber-100" />
      <circle cx="196" cy="34" r="9" className="fill-amber-400" />
      <path d="M0 150 L70 62 L110 104 L156 40 L240 150 Z" className="fill-primary-100" />
      <path d="M60 150 L130 76 L176 120 L200 98 L240 140 L240 150 Z" className="fill-primary-200" opacity=".75" />
      <path
        d="M24 146 C70 136, 64 118, 98 112 S 128 84, 146 64 S 152 48, 156 42"
        fill="none"
        strokeWidth="2.5"
        strokeDasharray="5 6"
        strokeLinecap="round"
        className="stroke-primary-600"
      />
      <circle cx="24" cy="146" r="5" className="fill-primary-600" />
      <circle cx="98" cy="112" r="5" className="fill-primary-600" />
      <circle cx="128" cy="84" r="6" strokeWidth="2.5" className="fill-white stroke-primary-600" />
      <path d="M156 42 V14" strokeWidth="2" className="stroke-slate-600" />
      <path d="M156 14 L176 20 L156 27 Z" className="fill-amber-500" />
    </svg>
  );
}

/** Đầu trang Tổng quan: lời chào, nút tiếp tục việc đang dở và hành trình 5 chặng. */
export function QuickStrip() {
  const { user } = useSession();
  const { data } = useDashboard();
  if (!data) return null;

  const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";
  const { steps, current } = journeySteps(data);

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center gap-6">
        <div className="min-w-0 flex-1">
          {data.market && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
              <Briefcase className="size-3.5" />
              {data.market.occupationName}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Chào {firstName}, tiếp tục hành trình nhé
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Bạn đã qua {Math.min(current, steps.length)}/{steps.length} chặng.
            {data.market && (
              <>
                {" "}Tuần này có <b className="text-slate-900">{data.market.total} tin mới</b> trong ngành của bạn.
              </>
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {data.resume ? (
              <>
                <Link
                  href={`/dashboard/jobs/${data.resume.jobId}`}
                  className="inline-flex h-10.5 items-center gap-2 rounded-xl bg-primary-600 px-4.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <FileText className="size-4.5" />
                  Tiếp tục tối ưu CV
                </Link>
                <span className="text-sm text-slate-500">
                  Đang dở: <b className="text-slate-800">{data.resume.title} · {data.resume.company}</b>
                  {data.resume.score !== null && ` (${data.resume.score} điểm)`}
                </span>
              </>
            ) : (
              <Link
                href="/dashboard/jobs?scored=1"
                className="inline-flex h-10.5 items-center gap-2 rounded-xl bg-primary-600 px-4.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <MagnifyingGlass className="size-4.5" />
                Xem việc làm phù hợp
              </Link>
            )}
          </div>
        </div>
        <JourneyIllustration />
      </div>

      <Stepper steps={steps} current={current} className="mt-7" />
    </Card>
  );
}
