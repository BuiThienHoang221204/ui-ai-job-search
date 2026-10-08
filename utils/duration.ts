
/** Số nguyên theo cách viết tiếng Việt, ví dụ "1.234". */
export function formatCount(value: number): string {
  return value.toLocaleString("vi-VN");
}
