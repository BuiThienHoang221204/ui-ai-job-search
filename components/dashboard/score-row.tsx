import { Progress } from "@/components/ui/progress";
import { scoreBarClass } from "@/utils";

/** Đổi điểm sang phần trăm; `null` giữ nguyên để không bị vẽ thành 0%. */
const asPercent = (value: number | null): string =>
  value === null ? "—" : `${value}%`;

interface ScoreBarProps {
  label: string;
  weight: string;
  value: number | null;
}

/** Một chiều đánh giá kèm thanh tiến độ — dùng ở trang chi tiết công việc. */
export function ScoreBar({ label, weight, value }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono font-semibold text-slate-900">
          {asPercent(value)}
        </span>
      </div>
      <Progress value={value ?? 0} barClassName={scoreBarClass(value)} />
      <p className="mt-1 text-3xs text-slate-400">trọng số {weight}</p>
    </div>
  );
}
