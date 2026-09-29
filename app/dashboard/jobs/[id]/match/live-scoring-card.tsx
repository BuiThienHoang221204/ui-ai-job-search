import { Check, CircleNotch } from "@phosphor-icons/react/ssr";
import { ModelElapsed } from "@/components/dashboard/model-elapsed";
import { SectionCard } from "@/components/ui/section-card";
import type { PartialEvaluation } from "@/lib/match-stream";

const LIVE_ROWS = [
  { label: "Điều kiện dự tuyển", of: (p: PartialEvaluation) => p.eligibility?.verdict },
  { label: "Kỹ năng chuyên môn", of: (p: PartialEvaluation) => p.technical?.score },
  { label: "Kinh nghiệm làm việc", of: (p: PartialEvaluation) => p.experience?.score },
  { label: "Nhận xét tổng hợp", of: (p: PartialEvaluation) => p.recommendation },
] as const;

/** Đo trên `ai_calls`: `match.evaluate` trung bình khoảng 40 giây qua omniroute. */
const EXPECTED_SCORING_SECONDS = 40;

export function LiveScoringCard({ partial }: { partial: PartialEvaluation | null }) {
  return (
    <SectionCard compact title="Đang chấm điểm">
      <ModelElapsed expected={EXPECTED_SCORING_SECONDS} />
      <ul className="space-y-2">
        {LIVE_ROWS.map(({ label, of }) => {
          const value = partial ? of(partial) : undefined;
          const done = value !== undefined && value !== null && value !== "";
          return (
            <li key={label} className="flex items-center gap-2 text-sm">
              {done ? (
                <Check className="size-4.5 shrink-0 text-emerald-600" />
              ) : (
                <CircleNotch className="size-4.5 shrink-0 animate-spin text-slate-300" />
              )}
              <span className={done ? "text-slate-800" : "text-slate-400"}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
