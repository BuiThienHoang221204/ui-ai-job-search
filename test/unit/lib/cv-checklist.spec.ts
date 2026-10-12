import { describe, expect, test } from "vitest";
import { cvChecklist, cvText, hasKeyword, withSkill } from "@/lib/cv-checklist";
import type { CvContentInput } from "@/services";

const cv = (overrides: Partial<CvContentInput> = {}): CvContentInput => ({
  profileStatement: "Fullstack developer dùng Node.js và React.",
  coreCompetencies: [],
  experiences: [
    {
      position: "Backend Developer",
      company: "Hồ sơ không cung cấp tên công ty",
      location: "",
      period: "2023 – nay",
      bullets: [
        "Xây dựng luồng thanh toán cho hơn 2.000 chủ cửa hàng",
        "Tối ưu truy vấn PostgreSQL",
      ],
    },
  ],
  projects: [],
  educations: [
    { degree: "", institution: "ĐH Bách khoa", period: "", detail: "" },
  ],
  skillGroups: [{ label: "Backend", items: ["NestJS", "Docker"] }],
  ...overrides,
});

describe("hasKeyword", () => {
  const text = cvText(cv());

  test("khớp không phân biệt hoa thường và dấu chấm (Node.js = NodeJS)", () => {
    expect(hasKeyword(text, "NodeJS")).toBe(true);
    expect(hasKeyword(text, "docker")).toBe(true);
  });

  test("không ăn một phần của từ khác: Java không khớp JavaScript", () => {
    expect(
      hasKeyword(cvText(cv({ profileStatement: "JavaScript" })), "Java"),
    ).toBe(false);
  });

  test("cụm ghép chỉ cần có một phần", () => {
    expect(hasKeyword(text, "Vue, Angular, React")).toBe(true);
    expect(hasKeyword(text, "Vue, Angular")).toBe(false);
  });
});

describe("cvChecklist", () => {
  test("đếm đúng từ khoá thiếu, chỗ trống (kể cả câu giữ chỗ) và câu chưa có số liệu", () => {
    const { todos, done, total } = cvChecklist(cv(), ["React", "Redux"], []);
    const open = todos.filter((todo) => !todo.done).map((todo) => todo.id);

    expect(open).toEqual([
      "kw:Redux",
      "exp:0:company",
      "exp:0:bullet:1",
      "edu:0:degree",
    ]);
    expect([done, total]).toEqual([2, 6]);
  });

  test("từ khoá người dùng bỏ qua thì tính là xong", () => {
    const { todos } = cvChecklist(cv(), ["Redux"], ["Redux"]);
    expect(todos[0].done).toBe(true);
  });

  test("điền tên công ty thật thì hết việc đó", () => {
    const filled = cv();
    filled.experiences[0] = { ...filled.experiences[0], company: "Digistore" };
    const ids = cvChecklist(filled, [], []).todos.map((todo) => todo.id);
    expect(ids).not.toContain("exp:0:company");
  });
});

describe("withSkill", () => {
  test("thêm vào nhóm kỹ năng cuối, không sửa bản gốc", () => {
    const before = cv();
    const after = withSkill(before, "Redux");
    expect(after.skillGroups[0].items).toEqual(["NestJS", "Docker", "Redux"]);
    expect(before.skillGroups[0].items).toEqual(["NestJS", "Docker"]);
  });

  test("CV chưa có nhóm nào thì tạo nhóm mới", () => {
    expect(withSkill(cv({ skillGroups: [] }), "Redux").skillGroups).toEqual([
      { label: "Kỹ năng khác", items: ["Redux"] },
    ]);
  });
});
