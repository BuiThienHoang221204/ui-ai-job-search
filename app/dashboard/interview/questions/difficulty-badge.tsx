import { cn } from "@/lib/cn";

const LEVELS: Record<string, { bars: number; tone: string; on: string; off: string }> = {
  "Dễ": {
    bars: 1,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    on: "bg-emerald-500",
    off: "bg-emerald-200",
  },
  "Trung bình": {
    bars: 2,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    on: "bg-amber-500",
    off: "bg-amber-200",
  },
  "Khó": {
    bars: 3,
    tone: "bg-rose-50 text-rose-700 ring-rose-100",
    on: "bg-rose-500",
    off: "bg-rose-200",
  },
};

const BAR_HEIGHTS = ["h-[5px]", "h-2", "h-3"];

/** Nhãn độ khó: ba vạch cao dần, số vạch tô màu theo mức Dễ / Trung bình / Khó. */
export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const level = LEVELS[difficulty];
  if (!level) return <span className="text-xs text-slate-500">{difficulty}</span>;

  return (
    <span
      className={cn(
        "inline-flex h-6.5 shrink-0 items-center gap-1.5 rounded-full pr-2.5 pl-2 text-[13px] font-semibold whitespace-nowrap ring-1 ring-inset",
        level.tone,
      )}
    >
      <span aria-hidden className="flex h-3 items-end gap-0.5">
        {BAR_HEIGHTS.map((height, index) => (
          <span
            key={height}
            className={cn("w-[3px] rounded-sm", height, index < level.bars ? level.on : level.off)}
          />
        ))}
      </span>
      {difficulty}
    </span>
  );
}
