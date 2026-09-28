/** Quy một mức lương về phần trăm trên một thang cho trước. */
export function scalePercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/** `left` và `width` của một dải [from, to] trên thang [min, max]. */
export function scaleBand(
  from: number,
  to: number,
  min: number,
  max: number,
): { left: string; width: string } {
  const start = scalePercent(from, min, max);
  const end = scalePercent(to, min, max);
  return {
    left: `${start}%`,
    width: `${Math.max(end - start, 0.8)}%`,
  };
}
