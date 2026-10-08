import type { ProfileRecord } from "@/services";

export type ProfileUpdate = Partial<
  Omit<
    ProfileRecord,
    "id" | "userId" | "completion" | "createdAt" | "updatedAt"
  >
>;

export type Item = Record<string, unknown>;

export const EXPERIENCE_LEVELS = [
  { value: "INTERN", label: "Thực tập sinh" },
  { value: "FRESHER", label: "Mới tốt nghiệp" },
  { value: "JUNIOR", label: "Junior (1–3 năm)" },
  { value: "MIDDLE", label: "Middle (3–5 năm)" },
  { value: "SENIOR", label: "Senior (5–8 năm)" },
  { value: "LEAD", label: "Lead (trên 8 năm)" },
];

export const EMPLOYMENT_OPTIONS = [
  "Đang tìm việc",
  "Đang đi làm, sẵn sàng đổi",
  "Chưa muốn đổi việc",
];
export const REMOTE_OPTIONS = [
  "Tại văn phòng",
  "Hybrid",
  "Remote",
  "Sao cũng được",
];
export const COMMUTE_OPTIONS = [
  "30 phút",
  "45 phút",
  "60 phút",
  "Không quan trọng",
];
export const WORK_PERMIT_OPTIONS = [
  "Không cần (làm tại Việt Nam)",
  "Đã có",
  "Cần công ty bảo lãnh",
];

export const SECTOR_OPTIONS = [
  "Công nghệ",
  "Tài chính – Ngân hàng",
  "Thương mại điện tử",
  "Giáo dục",
  "Y tế",
  "Sản xuất",
  "Bán lẻ",
  "Logistics",
];
export const ENERGIZING_OPTIONS = [
  "Giải quyết vấn đề khó",
  "Làm việc với con người",
  "Làm việc với số liệu",
  "Sáng tạo nội dung",
  "Hướng dẫn người khác",
  "Làm việc độc lập",
];
export const DRAINING_OPTIONS = [
  "Họp nhiều",
  "Việc lặp lại",
  "Làm ngoài giờ",
  "Áp lực doanh số",
  "Đi công tác nhiều",
];
export const DEAL_BREAKER_OPTIONS = [
  "OT thường xuyên",
  "Không ký hợp đồng",
  "Làm thứ Bảy",
  "Đi công tác dài",
  "Lương thử việc dưới 85%",
];
export const WORK_STYLE_OPTIONS = [
  "Tự chủ, ít cần giao việc",
  "Thích quy trình rõ ràng",
  "Nhanh, chấp nhận thay đổi",
  "Cẩn thận, chắc từng bước",
];
export const TEAM_OPTIONS = [
  "Nhóm nhỏ dưới 8 người",
  "Công ty lớn, nhiều phòng ban",
  "Startup",
  "Làm cùng khách hàng nước ngoài",
];

export const text = (value: unknown) =>
  typeof value === "string" ? value : "";

export const strings = (value: unknown): string[] => {
  if (typeof value === "string") return value ? [value] : [];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
};

const isItem = (value: unknown): value is Item =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asItems = (value: unknown): Item[] =>
  Array.isArray(value) ? value.filter(isItem) : [];

export const asObject = (value: unknown): Item => (isItem(value) ? value : {});

export type RecordType =
  "experiences" | "projects" | "educations" | "certificates";

/** Ô nhập: `lines` là mảng chuỗi gõ mỗi dòng một ý, `tags` là mảng chuỗi ngăn bằng dấu phẩy. */
export interface RecordField {
  name: string;
  label: string;
  placeholder: string;
  kind?: "lines" | "tags" | "area";
}

export interface RecordView {
  title: string;
  sub: string;
  when: string;
  lines: string[];
  tags: string[];
}

export const RECORDS: Record<
  RecordType,
  {
    title: string;
    empty: string;
    fields: RecordField[];
    view: (item: Item) => RecordView;
  }
> = {
  experiences: {
    title: "Kinh nghiệm",
    empty:
      "Chưa có kinh nghiệm nào. AI cần phần này để viết CV và chấm phần Kinh nghiệm.",
    fields: [
      {
        name: "position",
        label: "Chức danh",
        placeholder: "Backend Developer",
      },
      { name: "company", label: "Công ty", placeholder: "Công ty ABC" },
      { name: "period", label: "Thời gian", placeholder: "03/2023 – nay" },
      { name: "location", label: "Nơi làm", placeholder: "Hồ Chí Minh" },
      {
        name: "highlights",
        label: "Việc đã làm, kết quả",
        placeholder: "Mỗi dòng một ý, có số liệu càng tốt",
        kind: "lines",
      },
    ],
    view: (item) => ({
      title: text(item.position),
      sub: text(item.company),
      when: text(item.period),
      lines: strings(item.highlights),
      tags: [],
    }),
  },
  projects: {
    title: "Dự án",
    empty: "Chưa có dự án nào.",
    fields: [
      { name: "name", label: "Tên dự án", placeholder: "Cổng tra cứu hoá đơn" },
      { name: "period", label: "Thời gian", placeholder: "2025 – nay" },
      {
        name: "description",
        label: "Mô tả, kết quả",
        placeholder: "Bạn làm gì, kết quả ra sao",
        kind: "area",
      },
      {
        name: "technologies",
        label: "Công nghệ, công cụ",
        placeholder: "NestJS, PostgreSQL",
        kind: "tags",
      },
    ],
    view: (item) => ({
      title: text(item.name),
      sub: "",
      when: text(item.period),
      lines: text(item.description) ? [text(item.description)] : [],
      tags: strings(item.technologies),
    }),
  },
  educations: {
    title: "Học vấn",
    empty:
      "Chưa có học vấn. Nhiều tin yêu cầu bằng cấp, thiếu phần này AI không kiểm được.",
    fields: [
      { name: "school", label: "Trường", placeholder: "Đại học Bách khoa" },
      { name: "degree", label: "Bằng cấp", placeholder: "Kỹ sư, Cử nhân…" },
      {
        name: "field",
        label: "Chuyên ngành",
        placeholder: "Khoa học máy tính",
      },
      { name: "period", label: "Thời gian", placeholder: "2016 – 2020" },
    ],
    view: (item) => ({
      title: text(item.school),
      sub: [text(item.degree), text(item.field)].filter(Boolean).join(", "),
      when: text(item.period),
      lines: [],
      tags: [],
    }),
  },
  certificates: {
    title: "Chứng chỉ",
    empty: "Chưa có chứng chỉ nào.",
    fields: [
      { name: "name", label: "Tên chứng chỉ", placeholder: "IELTS 7.0" },
      { name: "issuer", label: "Nơi cấp", placeholder: "IDP" },
      { name: "year", label: "Năm cấp", placeholder: "2025" },
    ],
    view: (item) => ({
      title: text(item.name),
      sub: text(item.issuer),
      when: text(item.year) ? `Năm ${text(item.year)}` : "",
      lines: [],
      tags: [],
    }),
  },
};

/** Giá trị form (toàn chuỗi) của một mục; mảng được nối lại để gõ được. */
export function toFormValues(
  type: RecordType,
  item: Item,
): Record<string, string> {
  return Object.fromEntries(
    RECORDS[type].fields.map((field) => {
      const value = item[field.name];
      if (field.kind === "lines")
        return [field.name, strings(value).join("\n")];
      if (field.kind === "tags") return [field.name, strings(value).join(", ")];
      return [field.name, text(value)];
    }),
  );
}

/** Ghép giá trị form vào mục cũ; giữ nguyên các khoá form không có. */
export function fromFormValues(
  type: RecordType,
  values: Record<string, string>,
  original: Item,
): Item {
  const item: Item = { ...original };
  for (const field of RECORDS[type].fields) {
    const value = (values[field.name] ?? "").trim();
    if (field.kind === "lines")
      item[field.name] = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    else if (field.kind === "tags")
      item[field.name] = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    else item[field.name] = value;
  }
  return item;
}

export type ProfileTab = "cv" | "wish";

export interface Improvement {
  key: string;
  done: boolean;
  title: string;
  detail: string;
  tab: ProfileTab;
  anchor: string;
}

/** Việc nên làm để AI hiểu hồ sơ đúng hơn, suy hoàn toàn từ dữ liệu hồ sơ. */
export function improvements(profile: ProfileRecord): Improvement[] {
  return [
    {
      key: "level",
      done: profile.experienceLevel !== "UNKNOWN",
      title: "Chọn cấp bậc",
      detail: "Quyết định tin nào hiện ở “Việc làm phù hợp”",
      tab: "cv",
      anchor: "profile-search",
    },
    {
      key: "skills",
      done: profile.primarySkills.length >= 5,
      title: "Ghi ít nhất 5 kỹ năng chính",
      detail: `Đang có ${profile.primarySkills.length}`,
      tab: "cv",
      anchor: "profile-skills",
    },
    {
      key: "experiences",
      done: asItems(profile.experiences).length > 0,
      title: "Thêm kinh nghiệm làm việc",
      detail: "AI dùng khi viết CV và chấm phần Kinh nghiệm",
      tab: "cv",
      anchor: "profile-experiences",
    },
    {
      key: "educations",
      done: asItems(profile.educations).length > 0,
      title: "Thêm học vấn",
      detail: "Để AI kiểm được tin yêu cầu bằng cấp",
      tab: "cv",
      anchor: "profile-educations",
    },
    {
      key: "energizing",
      done: profile.energizingTasks.length > 0,
      title: "Chọn việc bạn thấy hứng thú",
      detail: "Không có thì AI chỉ đoán định hướng từ chức danh",
      tab: "wish",
      anchor: "q-energizingTasks",
    },
    {
      key: "salary",
      done: profile.expectedSalary !== null,
      title: "Thêm mức lương mong muốn",
      detail: "Để gợi ý lương ở từng tin sát với bạn",
      tab: "wish",
      anchor: "q-salary",
    },
  ];
}

/** Số câu ở tab "Mong muốn tìm việc" chưa trả lời. */
export function unansweredWishes(profile: ProfileRecord): number {
  return [
    profile.careerGoals.length,
    profile.targetSectors.length,
    profile.energizingTasks.length,
    profile.drainingTasks.length,
    profile.dealBreakers.length,
    profile.remotePreference ? 1 : 0,
    profile.expectedSalary ?? 0,
  ].filter((value) => !value).length;
}
