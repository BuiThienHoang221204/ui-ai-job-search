import { boundedInt, isRecord, objectList, text, textList } from "./parse-json";

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

export interface HardGap {
  skill: string;
  demandCount: number | null;
  priority: number | null;
  evidence: string | null;
}

export interface SynthesisedGap {
  category: GapCategory | null;
  gap: string;
  why: string | null;
}

export interface LearningStep {
  topic: string;
  rationale: string | null;
  estimatedWeeks: number | null;
  resources: string[];
}

/** Đọc một kỹ năng thiếu từ JSON của model, hỏng thì trả null. */
function parseHardGap(value: unknown): HardGap | null {
  if (!isRecord(value)) return null;
  const skill = text(value.skill);
  if (!skill) return null;
  return {
    skill,
    demandCount: boundedInt(value.demandCount, 0, Number.MAX_SAFE_INTEGER),
    priority: boundedInt(value.priority, 0, 100),
    evidence: text(value.evidence),
  };
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

/** Đọc một bước học từ JSON của model, hỏng thì trả null. */
function parseLearningStep(
  value: unknown,
): { step: LearningStep; order: number | null } | null {
  if (!isRecord(value)) return null;
  const topic = text(value.topic);
  if (!topic) return null;
  return {
    order: boundedInt(value.order, 1, Number.MAX_SAFE_INTEGER),
    step: {
      topic,
      rationale: text(value.rationale),
      estimatedWeeks: boundedInt(value.estimatedWeeks, 1, 52),
      resources: textList(value.resources),
    },
  };
}

/** Kỹ năng thiếu, sắp theo độ ưu tiên giảm dần. */
export function parseHardGaps(value: unknown): HardGap[] {
  return objectList(value, parseHardGap).sort(
    (a, b) => (b.priority ?? -1) - (a.priority ?? -1),
  );
}

/** Đọc danh sách khoảng trống tổng hợp, bỏ các phần tử hỏng. */
export function parseSynthesisedGaps(value: unknown): SynthesisedGap[] {
  return objectList(value, parseSynthesisedGap);
}

/** Lộ trình học, sắp theo `order` của model và đánh lại số thứ tự. */
export function parseLearningPlan(value: unknown): LearningStep[] {
  return objectList(value, parseLearningStep)
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => {
      const left = a.order ?? Number.MAX_SAFE_INTEGER;
      const right = b.order ?? Number.MAX_SAFE_INTEGER;
      return left === right ? a.index - b.index : left - right;
    })
    .map((item) => item.step);
}

/** Báo cáo nâng cấp kỹ năng đã DONE nhưng không đọc được gì dùng được. */
export function isUpskillReportEmpty(report: {
  hardGaps: unknown;
  synthesisedGaps: unknown;
  learningPlan: unknown;
}): boolean {
  return (
    parseHardGaps(report.hardGaps).length === 0 &&
    parseSynthesisedGaps(report.synthesisedGaps).length === 0 &&
    parseLearningPlan(report.learningPlan).length === 0
  );
}
