import type { WeekDay } from "@/types";

export const WEEK_DAYS: { value: WeekDay; label: string; jsDay: number }[] = [
  { value: "MO", label: "T2", jsDay: 1 },
  { value: "TU", label: "T3", jsDay: 2 },
  { value: "WE", label: "T4", jsDay: 3 },
  { value: "TH", label: "T5", jsDay: 4 },
  { value: "FR", label: "T6", jsDay: 5 },
  { value: "SA", label: "T7", jsDay: 6 },
  { value: "SU", label: "CN", jsDay: 0 },
];

const STUDY_HOUR_VN = 20;
const VN_OFFSET_HOURS = 7;

const pad = (value: number) => String(value).padStart(2, "0");

/** Mốc UTC dạng `20261015T130000Z` mà lịch và file .ics đều đọc được. */
const utcStamp = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;

/** Buổi học đầu tiên: ngày gần nhất (tính cả hôm nay) rơi vào một trong các ngày đã chọn, lúc 20:00 giờ Việt Nam. */
export function firstSession(days: WeekDay[], now: Date): Date {
  const wanted = new Set(
    WEEK_DAYS.filter((day) => days.includes(day.value)).map((day) => day.jsDay),
  );
  const vnNow = new Date(now.getTime() + VN_OFFSET_HOURS * 3_600_000);
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(vnNow);
    day.setUTCDate(vnNow.getUTCDate() + offset);
    if (!wanted.has(day.getUTCDay())) continue;
    return new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        STUDY_HOUR_VN - VN_OFFSET_HOURS,
      ),
    );
  }
  return now;
}

const ruleOf = (days: WeekDay[]) =>
  `RRULE:FREQ=WEEKLY;BYDAY=${WEEK_DAYS.filter((day) => days.includes(day.value))
    .map((day) => day.value)
    .join(",")}`;

/** Link mở Google Calendar với sự kiện lặp hằng tuần, người dùng chỉ việc bấm Lưu. */
export function googleCalendarUrl(skill: string, days: WeekDay[], now: Date): string {
  const start = firstSession(days, now);
  const end = new Date(start.getTime() + 3_600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Học ${skill}`,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    recur: ruleOf(days),
    details: "Buổi học trong kế hoạch Lộ trình học của Careelot.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const escapeIcs = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** Nội dung file .ics cho sự kiện lặp hằng tuần — mở bằng app Lịch nào cũng được. */
export function icsContent(skill: string, days: WeekDay[], now: Date): string {
  const start = firstSession(days, now);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Careelot//Lo trinh hoc//VI",
    "BEGIN:VEVENT",
    `UID:${utcStamp(now)}-${skill.replace(/[^a-zA-Z0-9]/g, "")}@careelot`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(start)}`,
    "DURATION:PT1H",
    ruleOf(days),
    `SUMMARY:${escapeIcs(`Học ${skill}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** Tải file .ics ngay trên trình duyệt, không qua máy chủ. */
export function downloadIcs(skill: string, days: WeekDay[]) {
  const blob = new Blob([icsContent(skill, days, new Date())], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hoc-${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
