import type { CompanyVerdict } from "@/services";

export type VerdictTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export const VERDICT_LABELS: Record<
  CompanyVerdict,
  { label: string; variant: VerdictTone }
> = {
  POSITIVE: { label: "Đánh giá tích cực", variant: "success" },
  MIXED: { label: "Ý kiến trái chiều", variant: "warning" },
  NEGATIVE: { label: "Nhiều phàn nàn", variant: "danger" },
  NO_REVIEWS_YET: { label: "Chưa ai đánh giá", variant: "info" },
  UNKNOWN: { label: "Chưa đủ dữ liệu", variant: "neutral" },
};

/** Còn đang chờ lượt tra thông tin công ty chạy xong hay không, so theo mốc `updatedAt`. */
export function isBriefPending(
  pendingSince: string | null | undefined,
  updatedAt: string | null,
): boolean {
  return pendingSince !== undefined && updatedAt === pendingSince;
}
