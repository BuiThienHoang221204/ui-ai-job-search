import type { CvContentInput, CvSectionKey } from "@/services";

export const SECTION_LABELS: Record<CvSectionKey, string> = {
  profile: "Giới thiệu",
  competencies: "Năng lực chính",
  experience: "Kinh nghiệm",
  projects: "Dự án",
  education: "Học vấn",
  skills: "Kỹ năng",
};

export const ADD_ENTRY_LABELS: Partial<Record<CvSectionKey, string>> = {
  experience: "Thêm kinh nghiệm",
  projects: "Thêm dự án",
  education: "Thêm học vấn",
  skills: "Thêm nhóm kỹ năng",
};

/** Đổi chỗ hai phần tử, trả về chính mảng cũ nếu chỉ số nằm ngoài. */
export const swap = <T>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

type Node = Record<string, unknown> | unknown[];

/** Bản sao của `content` cùng nút cha của `path` trong bản sao đó. */
function cloneToParent(content: CvContentInput, path: string) {
  const copy = structuredClone(content);
  const keys = path.split(".");
  let parent: Node = copy as unknown as Node;
  for (const key of keys.slice(0, -1)) {
    parent = (parent as Record<string, unknown>)[key] as Node;
  }
  return { copy, parent, last: keys[keys.length - 1] };
}

/** Ghi chữ người dùng gõ trên CV vào đúng trường; trường là danh sách (kỹ năng, công cụ) thì tách theo dấu phẩy. */
export function setCvField(
  content: CvContentInput,
  path: string,
  text: string,
): CvContentInput {
  const { copy, parent, last } = cloneToParent(content, path);
  const record = parent as Record<string, unknown>;
  if (Array.isArray(record[last])) {
    record[last] = text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  } else {
    record[last] = text;
  }
  return copy;
}

/** Chèn một dòng trống ngay sau dòng `path` (một phần tử của danh sách chữ). */
export function insertCvLine(
  content: CvContentInput,
  path: string,
): CvContentInput {
  const { copy, parent, last } = cloneToParent(content, path);
  (parent as string[]).splice(Number(last) + 1, 0, "");
  return copy;
}

/** Xoá phần tử `path` khỏi danh sách chứa nó: một dòng (`…bullets.2`) hay cả một mục (`experiences.1`). */
export function removeCvItem(
  content: CvContentInput,
  path: string,
): CvContentInput {
  const { copy, parent, last } = cloneToParent(content, path);
  (parent as unknown[]).splice(Number(last), 1);
  return copy;
}

/** Thêm một mục trống vào cuối phần tương ứng; phần không có mục con (giới thiệu, năng lực) giữ nguyên. */
export function addCvEntry(
  content: CvContentInput,
  section: CvSectionKey,
): CvContentInput {
  const next = structuredClone(content);
  if (section === "experience") {
    next.experiences.push({
      position: "",
      company: "",
      location: "",
      period: "",
      bullets: [],
    });
  } else if (section === "projects") {
    next.projects.push({
      name: "",
      role: "",
      organization: "",
      period: "",
      description: "",
      bullets: [],
      tools: [],
    });
  } else if (section === "education") {
    next.educations.push({
      degree: "",
      institution: "",
      period: "",
      detail: "",
    });
  } else if (section === "skills") {
    next.skillGroups.push({ label: "", items: [] });
  }
  return next;
}

const filled = (items: string[]) => items.filter((item) => item.trim() !== "");

/** Bỏ dòng trống khỏi mọi danh sách chữ — máy chủ từ chối phần tử rỗng, và bản in không vẽ chúng. */
export function withoutEmptyLines(content: CvContentInput): CvContentInput {
  return {
    ...content,
    coreCompetencies: filled(content.coreCompetencies),
    experiences: content.experiences.map((experience) => ({
      ...experience,
      bullets: filled(experience.bullets),
    })),
    projects: content.projects.map((project) => ({
      ...project,
      bullets: filled(project.bullets),
      tools: filled(project.tools),
    })),
    skillGroups: content.skillGroups.map((group) => ({
      ...group,
      items: filled(group.items),
    })),
  };
}
