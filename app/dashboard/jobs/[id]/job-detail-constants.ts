import type { JobMatchWithJob } from "@/types";

export const SCORE_ROWS = [
  { key: "technicalScore", label: "Kỹ năng chuyên môn", weight: "30%" },
  { key: "experienceScore", label: "Kinh nghiệm làm việc", weight: "25%" },
] as const;

export const VERDICT_META: Record<
  NonNullable<JobMatchWithJob["verdict"]>,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  STRONG: { label: "Rất phù hợp", variant: "success" },
  GOOD: { label: "Phù hợp", variant: "success" },
  MODERATE: { label: "Phù hợp vừa", variant: "warning" },
  WEAK: { label: "Ít phù hợp", variant: "warning" },
  POOR: { label: "Không phù hợp", variant: "danger" },
};
