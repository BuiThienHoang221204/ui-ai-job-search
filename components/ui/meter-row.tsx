import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Một dòng số liệu: nhãn trái, số phải cùng hàng, thanh mảnh bên dưới; `warn` tô cam cho chỗ cần chú ý, `mark` là vạch mốc theo %. */
export function MeterRow({
  label,
  hint,
  value,
  percent,
  warn,
  mark,
}: {
  label: ReactNode;
  hint?: string;
  value: ReactNode;
  percent: number;
  warn?: boolean;
  mark?: number;
}) {
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5 text-sm">
      <span className="flex min-w-0 items-center gap-2 text-slate-700">
        {label}
        {hint && <span className={cn("text-xs text-slate-500", warn && "text-amber-600")}>{hint}</span>}
      </span>
      <b className={cn("font-semibold text-slate-900 tabular-nums", warn && "text-amber-600")}>{value}</b>
      <span className="relative col-span-2 h-1.5 rounded-full bg-slate-200/70">
        <span
          className={cn("absolute inset-y-0 left-0 rounded-full", warn ? "bg-amber-500" : "bg-primary-500")}
          style={{ width: `${width}%` }}
        />
        {mark !== undefined && (
          <span className="absolute -inset-y-1 w-0.5 rounded-full bg-slate-700" style={{ left: `${mark}%` }} />
        )}
      </span>
    </div>
  );
}
