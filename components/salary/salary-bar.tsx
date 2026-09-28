import { scaleBand, scalePercent } from "./salary-scale";

interface SalaryBarProps {
  from: number | null;
  to: number | null;
  marker?: number | null;
  scale: [number, number];
  size?: "sm" | "md";
}

/** Một dải lương vẽ trên thang cho trước, dùng chung cho trang danh sách và chi tiết. */
export function SalaryBar({ from, to, marker, scale, size = "sm" }: SalaryBarProps) {
  if (from === null || to === null) return null;

  const track = size === "md" ? "h-6" : "h-5";

  return (
    <div className={`relative ${track} min-w-32 rounded bg-slate-100`}>
      <div
        className="bg-primary-300 absolute inset-y-1 rounded-sm"
        style={scaleBand(from, to, scale[0], scale[1])}
      />
      {marker !== null && marker !== undefined && (
        <div
          className="bg-primary-800 absolute inset-y-0.5 w-0.5"
          style={{ left: `${scalePercent(marker, scale[0], scale[1])}%` }}
        />
      )}
    </div>
  );
}
