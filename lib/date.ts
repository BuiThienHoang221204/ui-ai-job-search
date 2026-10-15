/** Ngày tháng năm dạng ngắn, ví dụ "09/08/2026". */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** Thời gian tương đối theo ngày từ mốc ISO, ví dụ "Hôm nay", "3 ngày trước". */
export function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

/** Như `relativeDay` nhưng mịn tới phút trong vòng một ngày đầu. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE_MS) return "vừa xong";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)} phút trước`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)} giờ trước`;
  return relativeDay(iso);
}
