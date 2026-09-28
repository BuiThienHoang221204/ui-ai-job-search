/** Định dạng thời lượng tự chọn đơn vị ms, giây hoặc phút. */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} giây`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} phút ${Math.round(seconds % 60)} giây`;
}

/** Số nguyên theo cách viết tiếng Việt, ví dụ "1.234". */
export function formatCount(value: number): string {
  return value.toLocaleString("vi-VN");
}
