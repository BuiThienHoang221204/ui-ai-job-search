import type { ApplicationGroup, ApplicationStatus } from "@/types";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  VIEWED: "Đã xem",
  APPLIED: "Đã nộp",
  WITHDRAWN: "Đã hủy",
};

export const APPLICATION_STATUS_VARIANTS: Record<
  ApplicationStatus,
  "info" | "success" | "danger"
> = {
  VIEWED: "info",
  APPLIED: "success",
  WITHDRAWN: "danger",
};

export const APPLICATION_TABS: Array<{
  value: "all" | ApplicationGroup;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
];

export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  VIEWED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["WITHDRAWN", "VIEWED"],
  WITHDRAWN: ["APPLIED", "VIEWED"],
};
