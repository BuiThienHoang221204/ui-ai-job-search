import type { ApplicationStatus } from "@/types";

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

export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  VIEWED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["WITHDRAWN", "VIEWED"],
  WITHDRAWN: ["APPLIED", "VIEWED"],
};
