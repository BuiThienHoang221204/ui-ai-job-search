import type { CvBullet, CvTodo, CvContentInput } from "@/types";
import { fold } from "@/lib/text";

export const HOLE = "[__]";

/** Đường dẫn `data-field` trên trang CV của một chỗ viết lại được. */
export function bulletPath(bullet: CvBullet): string {
  switch (bullet.kind) {
    case "profile":
      return "profileStatement";
    case "headline":
      return "identity.title";
    case "competency":
      return `coreCompetencies.${bullet.line}`;
    case "description":
      return `projects.${bullet.entry}.description`;
    case "experience":
      return `experiences.${bullet.entry}.bullets.${bullet.line}`;
    case "project":
      return `projects.${bullet.entry}.bullets.${bullet.line}`;
  }
}

const BULLET_PATH = /^(experiences|projects)\.(\d+)\.bullets\.(\d+)$/;
const DESCRIPTION_PATH = /^projects\.(\d+)\.description$/;
const COMPETENCY_PATH = /^coreCompetencies\.(\d+)$/;

/** Chỗ viết lại được ứng với một đường dẫn `data-field`, hoặc `null` với các ô là dữ kiện (tên, công ty, thời gian…). */
export function bulletOf(path: string): CvBullet | null {
  if (path === "profileStatement") return { kind: "profile" };
  if (path === "identity.title") return { kind: "headline" };

  const competency = COMPETENCY_PATH.exec(path);
  if (competency) return { kind: "competency", line: Number(competency[1]) };

  const description = DESCRIPTION_PATH.exec(path);
  if (description)
    return { kind: "description", entry: Number(description[1]) };

  const match = BULLET_PATH.exec(path);
  if (!match) return null;
  return {
    kind: match[1] === "experiences" ? "experience" : "project",
    entry: Number(match[2]),
    line: Number(match[3]),
  };
}

/** Một dòng ngữ cảnh gửi kèm chữ cần viết lại: vị trí tại công ty, tên dự án, hay đó là mục nào. */
export function rewriteContext(
  content: CvContentInput,
  bullet: CvBullet,
): string {
  switch (bullet.kind) {
    case "profile":
      return "Đoạn giới thiệu đầu CV";
    case "headline":
      return "Dòng chức danh ngay dưới tên";
    case "competency":
      return "Mục Năng lực chính";
    case "experience": {
      const item = content.experiences[bullet.entry];
      if (!item) return "";
      return [item.position, item.company].filter(filled).join(" tại ");
    }
    case "project":
    case "description": {
      const item = content.projects[bullet.entry];
      if (!item) return "";
      return ["Dự án", item.name, item.role].filter(filled).join(" · ");
    }
  }
}

const PLACEHOLDER =
  /không cung cấp|chưa cung cấp|không có thông tin|not provided/i;

const filled = (value: string) =>
  value.trim() !== "" && !PLACEHOLDER.test(value);

const normalize = (value: string) => fold(value).replace(/[.\-_]/g, "");

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Toàn bộ chữ của CV gộp thành một chuỗi đã chuẩn hoá, để dò từ khoá. */
export function cvText(content: CvContentInput): string {
  return normalize(
    [
      content.profileStatement,
      ...content.coreCompetencies,
      ...content.experiences.flatMap((item) => [
        item.position,
        item.company,
        ...item.bullets,
      ]),
      ...content.projects.flatMap((item) => [
        item.name,
        item.description,
        ...item.bullets,
        ...item.tools,
      ]),
      ...content.educations.flatMap((item) => [item.degree, item.institution]),
      ...content.skillGroups.flatMap((group) => group.items),
    ].join(" \n "),
  );
}

/** Từ khoá có trong CV không: khớp nguyên từ (không ăn "java" trong "javascript"), cụm ghép "Vue, React" chỉ cần một phần. */
export function hasKeyword(text: string, keyword: string): boolean {
  return [keyword, ...keyword.split(/,|\/| hoặc | or /)]
    .map((part) => normalize(part).trim())
    .filter((part) => part.length > 1)
    .some((part) =>
      new RegExp(`(?:^|[^a-z0-9+#])${escape(part)}(?:$|[^a-z0-9+#])`).test(
        text,
      ),
    );
}

/** Việc cần làm để CV sẵn sàng gửi: từ khoá của tin, chỗ AI để trống, câu chưa có số liệu. */
export function cvChecklist(
  content: CvContentInput,
  keywords: string[],
  skipped: string[],
): { todos: CvTodo[]; done: number; total: number } {
  const text = cvText(content);
  const todos: CvTodo[] = [];

  for (const keyword of keywords) {
    todos.push({
      id: `kw:${keyword}`,
      kind: "keyword",
      section: "skills",
      label: keyword,
      hint: "Từ khoá của tin",
      done: skipped.includes(keyword) || hasKeyword(text, keyword),
    });
  }

  content.experiences.forEach((item, index) => {
    const where = `Kinh nghiệm · ${filled(item.position) ? item.position : `mục ${index + 1}`}`;
    if (!filled(item.company)) {
      todos.push({
        id: `exp:${index}:company`,
        kind: "field",
        section: "experience",
        label: "Tên công ty",
        hint: where,
        done: false,
      });
    }
    item.bullets.forEach((bullet, line) => {
      if (!bullet.trim()) return;
      if (bullet.includes(HOLE)) {
        todos.push({
          id: `exp:${index}:hole:${line}`,
          kind: "field",
          section: "experience",
          label: `Điền số liệu vào ${HOLE}`,
          hint: where,
          done: false,
          bullet: { kind: "experience", entry: index, line },
        });
        return;
      }
      todos.push({
        id: `exp:${index}:bullet:${line}`,
        kind: "metric",
        section: "experience",
        label: bullet,
        hint: where,
        done: /\d/.test(bullet),
        bullet: { kind: "experience", entry: index, line },
      });
    });
  });

  if (content.profileStatement.includes(HOLE)) {
    todos.push({
      id: "profile:hole",
      kind: "field",
      section: "profile",
      label: `Điền số liệu vào ${HOLE}`,
      hint: "Giới thiệu",
      done: false,
      bullet: { kind: "profile" },
    });
  }

  content.coreCompetencies.forEach((item, line) => {
    if (!item.includes(HOLE)) return;
    todos.push({
      id: `comp:${line}:hole`,
      kind: "field",
      section: "competencies",
      label: `Điền số liệu vào ${HOLE}`,
      hint: "Năng lực chính",
      done: false,
      bullet: { kind: "competency", line },
    });
  });

  content.projects.forEach((item, index) => {
    if (item.description.includes(HOLE)) {
      todos.push({
        id: `proj:${index}:description:hole`,
        kind: "field",
        section: "projects",
        label: `Điền số liệu vào ${HOLE}`,
        hint: `Mô tả dự án · ${filled(item.name) ? item.name : `mục ${index + 1}`}`,
        done: false,
        bullet: { kind: "description", entry: index },
      });
    }
    item.bullets.forEach((bullet, line) => {
      if (!bullet.includes(HOLE)) return;
      todos.push({
        id: `proj:${index}:hole:${line}`,
        kind: "field",
        section: "projects",
        label: `Điền số liệu vào ${HOLE}`,
        hint: `Dự án · ${filled(item.name) ? item.name : `mục ${index + 1}`}`,
        done: false,
        bullet: { kind: "project", entry: index, line },
      });
    });
  });

  content.educations.forEach((item, index) => {
    if (!filled(item.institution)) {
      todos.push({
        id: `edu:${index}:institution`,
        kind: "field",
        section: "education",
        label: "Tên trường",
        hint: "Học vấn",
        done: false,
      });
    }
    if (!filled(item.degree)) {
      todos.push({
        id: `edu:${index}:degree`,
        kind: "field",
        section: "education",
        label: "Bằng cấp",
        hint: "Học vấn",
        done: false,
      });
    }
  });

  return {
    todos,
    done: todos.filter((todo) => todo.done).length,
    total: todos.length,
  };
}

/** Thêm một kỹ năng vào nhóm kỹ năng cuối cùng (hoặc tạo nhóm mới khi CV chưa có nhóm nào). */
export function withSkill(
  content: CvContentInput,
  skill: string,
): CvContentInput {
  const groups = content.skillGroups;
  if (groups.length === 0) {
    return {
      ...content,
      skillGroups: [{ label: "Kỹ năng khác", items: [skill] }],
    };
  }
  const last = groups[groups.length - 1];
  return {
    ...content,
    skillGroups: [
      ...groups.slice(0, -1),
      { ...last, items: [...last.items, skill] },
    ],
  };
}
