"use client";

import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/ui/dash-section";
import { useDashboard } from "@/hooks/use-dashboard";
import { cn } from "@/lib/cn";
import { journeySteps } from "@/lib/onboarding";

/** Lộ trình tìm việc: năm chặng xếp dọc, chặng đang làm mở ra kèm một nút làm tiếp và kỹ năng nên học. */
export function JourneyCard() {
  const { data } = useDashboard();
  if (!data) return null;
  const { steps, current } = journeySteps(data);

  return (
    <DashSection
      title="Lộ trình tìm việc"
      action={<span className="text-xs text-slate-600">Chặng {Math.min(current + 1, steps.length)}/{steps.length}</span>}
    >
      <ol>
        {steps.map((step, index) => {
          const isNow = index === current;
          return (
            <li key={step.label} className="relative grid grid-cols-[1.625rem_minmax(0,1fr)] gap-3 pb-3 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn("absolute top-7 bottom-0 left-3 w-0.5", step.done ? "bg-primary-500" : "bg-slate-200")}
                />
              )}
              <span
                className={cn(
                  "relative grid size-6.5 place-items-center rounded-full border-[1.5px] text-2xs font-bold",
                  step.done && "border-primary-600 bg-primary-600 text-white",
                  isNow && "border-primary-600 bg-white text-primary-700 ring-4 ring-primary-100",
                  !step.done && !isNow && "border-slate-300 bg-white text-slate-500",
                )}
              >
                {step.done ? <Check weight="bold" className="size-3.5" /> : index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className={cn("text-sm", isNow ? "font-semibold text-slate-900" : "text-slate-600")}>{step.label}</p>
                {isNow && (
                  <>
                    <p className="mt-0.5 text-xs text-slate-600">{step.description}</p>
                    <Link
                      href={step.href}
                      className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                      {step.action}
                      <ArrowRight className="size-4" />
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {current >= steps.length && (
        <p className="mt-3 text-sm text-slate-600">Bạn đã đi hết năm chặng. Tiếp tục ứng tuyển và luyện phỏng vấn đều đặn nhé.</p>
      )}

      {data.skillGaps.length > 0 && (
        <p className="mt-4 text-xs text-slate-600">
          Kỹ năng nên học:{" "}
          {data.skillGaps.slice(0, 3).map((gap, index) => (
            <span key={gap.skill}>
              {index > 0 && " · "}
              <Link href="/dashboard/upskill" className="font-semibold text-primary-600 hover:text-primary-700">
                {gap.skill}
              </Link>{" "}
              ({gap.jobCount} tin)
            </span>
          ))}
        </p>
      )}
    </DashSection>
  );
}
