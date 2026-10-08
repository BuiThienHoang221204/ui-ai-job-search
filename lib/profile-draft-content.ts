import type { ProfileProposal, ProfileRecord } from "@/services";

const TEXT_FIELDS = [
  "headline",
  "location",
  "country",
  "summary",
] as const;
const LIST_FIELDS = [
  "primarySkills",
  "secondarySkills",
  "directExperienceDomains",
  "adjacentExperience",
  "languages",
] as const;
const ITEM_FIELDS = [
  "experiences",
  "projects",
  "educations",
  "certificates",
] as const;

const SKILL_FIELDS: readonly string[] = ["primarySkills", "secondarySkills"];

export type TextField = (typeof TEXT_FIELDS)[number];
export type ListField = (typeof LIST_FIELDS)[number];
export type ItemField = (typeof ITEM_FIELDS)[number];
export type Item = Record<string, unknown>;

export const FIELD_LABELS: Record<TextField | ListField, string> = {
  headline: "Chức danh",
  location: "Nơi ở",
  country: "Quốc gia",
  summary: "Giới thiệu",
  primarySkills: "Kỹ năng chính",
  secondarySkills: "Có dùng",
  directExperienceDomains: "Lĩnh vực đã làm trực tiếp",
  adjacentExperience: "Lĩnh vực có liên quan",
  languages: "Ngôn ngữ",
};

/** Khoá nhận ra hai mục là một (cùng công ty + chức danh, cùng trường…), để không thêm trùng. */
const ITEM_KEYS: Record<ItemField, string[]> = {
  experiences: ["company", "position"],
  projects: ["name"],
  educations: ["school"],
  certificates: ["name"],
};

const clean = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
const items = (value: unknown): Item[] =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is Item => typeof entry === "object" && entry !== null,
      )
    : [];
const itemKey = (field: ItemField, item: Item) =>
  ITEM_KEYS[field].map((key) => clean(item[key]).toLowerCase()).join("|");

export interface TextChange {
  field: TextField;
  current: string;
  proposed: string;
}

export interface ListChange {
  field: ListField;
  current: string[];
  added: string[];
}

export interface ItemChange {
  field: ItemField;
  current: Item[];
  added: Item[];
}

export interface Review {
  texts: TextChange[];
  lists: ListChange[];
  items: ItemChange[];
}

/** So bản đọc CV với hồ sơ: chỉ giữ lại phần CV có mà hồ sơ chưa có hoặc ghi khác. */
export function buildReview(
  proposal: ProfileProposal,
  profile: ProfileRecord | null,
): Review {
  const texts = TEXT_FIELDS.map((field) => ({
    field,
    current: clean(profile?.[field]),
    proposed: clean(proposal[field]),
  })).filter(
    (change) => change.proposed && !same(change.current, change.proposed),
  );

  const skills = [
    ...strings(profile?.primarySkills),
    ...strings(profile?.secondarySkills),
  ];
  const lists = LIST_FIELDS.map((field) => {
    const current = strings(profile?.[field]);
    const known = SKILL_FIELDS.includes(field) ? skills : current;
    const added = strings(proposal[field]).filter(
      (entry) => !known.some((have) => same(have, entry)),
    );
    return { field, current, added };
  }).filter((change) => change.added.length > 0);

  const itemChanges = ITEM_FIELDS.map((field) => {
    const current = items(profile?.[field]);
    const known = new Set(current.map((item) => itemKey(field, item)));
    const added = items(proposal[field]).filter(
      (item) => !known.has(itemKey(field, item)),
    );
    return { field, current, added };
  }).filter((change) => change.added.length > 0);

  return { texts, lists, items: itemChanges };
}

export function isReviewEmpty(review: Review): boolean {
  return review.texts.length + review.lists.length + review.items.length === 0;
}

/** Lựa chọn của người dùng trên màn xem lại. */
export interface ReviewChoices {
  useCv: Partial<Record<TextField, boolean>>;
  dropped: Partial<Record<ListField, string[]>>;
  added: Partial<Record<ItemField, Item[]>>;
}

/** Hồ sơ trống ở trường nào thì mặc định lấy từ CV; đã có thì mặc định giữ bản đang có. */
export function defaultChoices(review: Review): ReviewChoices {
  return {
    useCv: Object.fromEntries(
      review.texts.map((change) => [change.field, !change.current]),
    ),
    dropped: {},
    added: Object.fromEntries(
      review.items.map((change) => [change.field, change.added]),
    ),
  };
}

/** Giá trị cuối cùng gửi lên: danh sách và mục được gộp vào cái đang có, không thay hẳn. */
export function reviewValues(
  review: Review,
  choices: ReviewChoices,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const change of review.texts) {
    if (choices.useCv[change.field]) values[change.field] = change.proposed;
  }
  for (const change of review.lists) {
    const dropped = choices.dropped[change.field] ?? [];
    const kept = change.added.filter((entry) => !dropped.includes(entry));
    if (kept.length) values[change.field] = [...change.current, ...kept];
  }
  for (const change of review.items) {
    const kept = choices.added[change.field] ?? [];
    if (kept.length) values[change.field] = [...kept, ...change.current];
  }

  return values;
}
