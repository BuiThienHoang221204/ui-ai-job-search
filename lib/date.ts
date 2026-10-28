/** Ngày tháng năm dạng ngắn, ví dụ "09/08/2026". */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/** Giờ và ngày dạng ngắn theo giờ Việt Nam, ví dụ "07:30 24/10". */
export function formatClock(iso: string): string {
  const parts = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("hour")}:${part("minute")} ${part("day")}/${part("month")}`;
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

const WEEKS = 13;
const WEEK_MS = 7 * DAY_MS;

/** Tuần nào trong 13 tuần gần nhất có lần đăng, tuần cũ nhất đứng đầu. */
export function postedWeeks(dates: string[], now: Date): boolean[] {
  const weeks: boolean[] = Array.from({ length: WEEKS }, () => false);
  for (const date of dates) {
    const ago = Math.floor(
      (now.getTime() - new Date(date).getTime()) / WEEK_MS,
    );
    if (ago >= 0 && ago < WEEKS) weeks[WEEKS - 1 - ago] = true;
  }
  return weeks;
}
