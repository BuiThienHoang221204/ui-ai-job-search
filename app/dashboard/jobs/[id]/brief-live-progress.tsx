import { Check, CircleNotch } from "@phosphor-icons/react/ssr";
import { ModelElapsed } from "@/components/dashboard/model-elapsed";

/** Đo trên `ai_calls`: `company.brief` khoảng 25 giây, chưa kể các lượt tải trang nguồn trước đó. */
const EXPECTED_SECONDS = 35;

export interface PartialBrief {
  verdict?: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
  usedSources?: unknown[];
}

const ROWS = [
  { label: "Kết luận chung", of: (p: PartialBrief) => p.verdict },
  { label: "Tóm tắt", of: (p: PartialBrief) => p.summary },
  { label: "Điểm tốt", of: (p: PartialBrief) => p.pros?.length },
  { label: "Điểm hạn chế", of: (p: PartialBrief) => p.cons?.length },
] as const;

export function BriefLiveProgress({ partial }: { partial: PartialBrief | null }) {
  if (!partial) {
    return (
      <div>
        <ModelElapsed expected={EXPECTED_SECONDS} />
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <CircleNotch className="size-4.5 animate-spin text-slate-300" />
          Đang tìm và đọc các nguồn đánh giá…
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {ROWS.map(({ label, of }) => {
        const value = of(partial);
        const done = typeof value === "number" ? value > 0 : Boolean(value);
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
  );
}
