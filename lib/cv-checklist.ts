import type { CvContentInput } from "@/services";
import type { CvTodo } from "@/types";
import { fold } from "@/utils";

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
      todos.push({
        id: `exp:${index}:bullet:${line}`,
        kind: "metric",
        section: "experience",
        label: bullet,
        hint: where,
        done: /\d/.test(bullet),
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
