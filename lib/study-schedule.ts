import type { WeekDay } from "@/types";

export const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: "MO", label: "T2" },
  { value: "TU", label: "T3" },
  { value: "WE", label: "T4" },
  { value: "TH", label: "T5" },
  { value: "FR", label: "T6" },
  { value: "SA", label: "T7" },
  { value: "SU", label: "CN" },
];

const FIRST_HOUR = 6;
const LAST_HOUR = 23;
const REMIND_BEFORE_MINUTES = 15;

const pad = (value: number) => String(value).padStart(2, "0");

export const STUDY_TIMES: string[] = Array.from(
  { length: (LAST_HOUR - FIRST_HOUR) * 2 + 1 },
  (_, index) => `${pad(FIRST_HOUR + Math.floor(index / 2))}:${index % 2 ? "30" : "00"}`,
);

/** Giờ nhắc học: trước giờ học 15 phút, cùng quy tắc với cron ở backend. */
export function remindTime(studyTime: string): string {
  const [hours, minutes] = studyTime.split(":").map(Number);
  const total = hours * 60 + minutes - REMIND_BEFORE_MINUTES;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
