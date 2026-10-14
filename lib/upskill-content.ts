import { isRecord, objectList, text } from "./parse-json";

export const GAP_CATEGORIES = [
  "domain",
  "soft",
  "tooling",
  "credential",
] as const;

export type GapCategory = (typeof GAP_CATEGORIES)[number];

export const GAP_CATEGORY_LABELS: Record<GapCategory, string> = {
  domain: "Kiến thức ngành",
  soft: "Kỹ năng mềm",
  tooling: "Công cụ / quy trình",
  credential: "Chứng chỉ",
};

export interface SynthesisedGap {
  category: GapCategory | null;
  gap: string;
  why: string | null;
}

/** Đọc một khoảng trống tổng hợp từ JSON của model, hỏng thì trả null. */
function parseSynthesisedGap(value: unknown): SynthesisedGap | null {
  if (!isRecord(value)) return null;
  const gap = text(value.gap);
  if (!gap) return null;
  const rawCategory = text(value.category);
  return {
    category: GAP_CATEGORIES.includes(rawCategory as GapCategory)
      ? (rawCategory as GapCategory)
      : null,
    gap,
    why: text(value.why),
  };
}

/** Đọc danh sách khoảng trống tổng hợp, bỏ các phần tử hỏng. */
export function parseSynthesisedGaps(value: unknown): SynthesisedGap[] {
  return objectList(value, parseSynthesisedGap);
}
