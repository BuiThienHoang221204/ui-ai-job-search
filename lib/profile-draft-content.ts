import type { ProfileProposal, ProfileRecord } from "@/services";

export type FieldKind = "text" | "list" | "items";
export const APPLICABLE_FIELDS = [
  "headline",
  "location",
  "country",
  "summary",
  "languages",
  "primarySkills",
  "secondarySkills",
  "directExperienceDomains",
  "adjacentExperience",
  "experiences",
  "educations",
  "certificates",
  "projects",
] as const;

export type ApplicableField = (typeof APPLICABLE_FIELDS)[number];

const LABELS: Record<ApplicableField, string> = {
  headline: "Chức danh một dòng",
  location: "Nơi ở",
  country: "Quốc gia",
  summary: "Giới thiệu bản thân",
  languages: "Ngôn ngữ",
  primarySkills: "Kỹ năng thành thạo",
  secondarySkills: "Kỹ năng đã dùng",
  directExperienceDomains: "Lĩnh vực đã làm trực tiếp",
  adjacentExperience: "Lĩnh vực liên quan gần",
  experiences: "Kinh nghiệm làm việc",
  educations: "Học vấn",
  certificates: "Chứng chỉ",
  projects: "Dự án",
};

const KINDS: Record<ApplicableField, FieldKind> = {
  headline: "text",
  location: "text",
  country: "text",
  summary: "text",
  languages: "list",
  primarySkills: "list",
  secondarySkills: "list",
  directExperienceDomains: "list",
  adjacentExperience: "list",
  experiences: "items",
  educations: "items",
  certificates: "items",
  projects: "items",
};

export interface ProposalRow {
  field: ApplicableField;
  label: string;
  kind: FieldKind;
  proposed: string[];
  current: string[];
  isEmpty: boolean;
  overwrites: boolean;
  unchanged: boolean;
}

const SEP = String.fromCharCode(0);

/** Hai danh sách dòng có cùng nội dung hay không, bỏ qua thứ tự. */
const sameLines = (a: string[], b: string[]): boolean =>
  a.length === b.length &&
  [...a].sort().join(SEP) === [...b].sort().join(SEP);

/** Chuỗi không rỗng thành mảng một dòng, còn lại thành mảng rỗng. */
const text = (value: unknown): string[] =>
  typeof value === "string" && value.trim().length > 0 ? [value.trim()] : [];

/** Lọc ra các chuỗi không rỗng từ một mảng bất kỳ. */
const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

const ITEM_PARTS = {
  experiences: ["position", "company", "period"],
  educations: ["school", "field", "period"],
  certificates: ["name", "issuer", "year"],
  projects: ["name", "technologies"],
} as const satisfies Record<string, readonly string[]>;

type ItemField = keyof typeof ITEM_PARTS;

/** Trường có phải loại danh sách mục (kinh nghiệm, học vấn...) hay không. */
const isItemField = (field: ApplicableField): field is ItemField =>
  field in ITEM_PARTS;

/** Rút một phần của mục thành chuỗi; mảng ghép bằng dấu phẩy, kiểu khác bị bỏ. */
const part = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .join(", ");
  }
  return typeof value === "string" ? value.trim() : "";
};

/** Rút một mảng mục (đề xuất hay hồ sơ) thành các dòng chữ, bỏ phần tử hỏng. */
function itemLines(field: ItemField, value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return "";
      const record = item as Record<string, unknown>;
      return ITEM_PARTS[field]
        .map((key) => part(record[key]))
        .filter((piece) => piece.length > 0)
        .join(" · ");
    })
    .filter((line) => line.length > 0);
}

/** Chuyển giá trị của MỘT trường trong đề xuất thành dòng chữ. */
export function proposedLines(
  field: ApplicableField,
  proposal: ProfileProposal,
): string[] {
  switch (field) {
    case "headline":
    case "location":
    case "country":
    case "summary":
      return text(proposal[field]);
    case "languages":
    case "primarySkills":
    case "secondarySkills":
    case "directExperienceDomains":
    case "adjacentExperience":
      return list(proposal[field]);
    case "experiences":
    case "educations":
    case "certificates":
    case "projects":
      return itemLines(field, proposal[field]);
  }
}

/** Chuyển giá trị của MỘT trường trong hồ sơ hiện tại thành dòng chữ. */
export function currentLines(
  field: ApplicableField,
  profile: ProfileRecord | null,
): string[] {
  if (!profile) return [];

  switch (KINDS[field]) {
    case "text":
      return text((profile as unknown as Record<string, unknown>)[field]);
    case "list":
      return list((profile as unknown as Record<string, unknown>)[field]);
    case "items":
      return isItemField(field)
        ? itemLines(field, (profile as unknown as Record<string, unknown>)[field])
        : [];
  }
}

/** Dựng các hàng so sánh đề xuất với hồ sơ hiện tại cho màn xác nhận. */
export function proposalRows(
  proposal: ProfileProposal,
  profile: ProfileRecord | null,
): ProposalRow[] {
  return APPLICABLE_FIELDS.map((field) => {
    const proposed = proposedLines(field, proposal);
    const current = currentLines(field, profile);

    const unchanged =
      proposed.length > 0 && current.length > 0 && sameLines(proposed, current);

    return {
      field,
      label: LABELS[field],
      kind: KINDS[field],
      proposed,
      current,
      isEmpty: proposed.length === 0,
      overwrites: proposed.length > 0 && current.length > 0 && !unchanged,
      unchanged,
    };
  });
}

/** Những trường được tích sẵn khi mở màn xác nhận. */
export function defaultSelection(rows: ProposalRow[]): ApplicableField[] {
  return rows
    .filter((row) => !row.isEmpty && !row.overwrites && !row.unchanged)
    .map((row) => row.field);
}

/** Bản nháp không có gì đáng hiện — khác hẳn với "đang đọc". */
export function isProposalEmpty(proposal: ProfileProposal | null): boolean {
  if (!proposal) return true;
  return APPLICABLE_FIELDS.every(
    (field) => proposedLines(field, proposal).length === 0,
  );
}
