import { describe, expect, it } from "vitest";
import {
  addCvEntry,
  insertCvLine,
  removeCvItem,
  setCvField,
  swap,
  withoutEmptyLines,
} from "@/lib/cv-fields";
import type { CvContentInput } from "@/types";

const cv = (): CvContentInput => ({
  profileStatement: "Kế toán tổng hợp",
  coreCompetencies: ["Hạch toán"],
  experiences: [
    {
      position: "Kế toán",
      company: "Đại Phát",
      location: "Đà Nẵng",
      period: "2025 - nay",
      bullets: ["Hạch toán 400 chứng từ", "Đối chiếu công nợ"],
    },
  ],
  projects: [
    {
      name: "Chuyển đổi Misa",
      role: "",
      organization: "",
      period: "",
      description: "",
      bullets: [],
      tools: ["Misa"],
    },
  ],
  educations: [],
  skillGroups: [{ label: "Phần mềm", items: ["Misa", "Excel"] }],
});

describe("setCvField", () => {
  it("ghi chữ vào đúng trường theo địa chỉ, không sửa bản gốc", () => {
    const before = cv();
    const after = setCvField(before, "experiences.0.bullets.1", "Mới");

    expect(after.experiences[0].bullets).toEqual([
      "Hạch toán 400 chứng từ",
      "Mới",
    ]);
    expect(before.experiences[0].bullets[1]).toBe("Đối chiếu công nợ");
  });

  it("trường là danh sách thì tách theo dấu phẩy và bỏ mục rỗng", () => {
    const after = setCvField(
      cv(),
      "skillGroups.0.items",
      "Misa, Excel , ,Fast",
    );

    expect(after.skillGroups[0].items).toEqual(["Misa", "Excel", "Fast"]);
  });

  it("gõ vào dòng gợi ý của danh sách đang rỗng thì tạo phần tử đầu", () => {
    const after = setCvField(cv(), "projects.0.bullets.0", "Viết quy trình");

    expect(after.projects[0].bullets).toEqual(["Viết quy trình"]);
  });
});

describe("insertCvLine / removeCvItem", () => {
  it("chèn dòng trống ngay sau dòng đang đứng", () => {
    const after = insertCvLine(cv(), "experiences.0.bullets.0");

    expect(after.experiences[0].bullets).toEqual([
      "Hạch toán 400 chứng từ",
      "",
      "Đối chiếu công nợ",
    ]);
  });

  it("xoá được một dòng lẫn cả một mục", () => {
    const content = cv();

    expect(
      removeCvItem(content, "experiences.0.bullets.0").experiences[0].bullets,
    ).toEqual(["Đối chiếu công nợ"]);
    expect(removeCvItem(content, "experiences.0").experiences).toEqual([]);
  });
});

describe("addCvEntry", () => {
  it("thêm một mục trống vào cuối đúng phần", () => {
    expect(addCvEntry(cv(), "education").educations).toEqual([
      { degree: "", institution: "", period: "", detail: "" },
    ]);
    expect(addCvEntry(cv(), "skills").skillGroups).toHaveLength(2);
  });

  it("phần không có mục con thì giữ nguyên", () => {
    const content = cv();

    expect(addCvEntry(content, "profile")).toEqual(content);
  });
});

describe("withoutEmptyLines", () => {
  // Máy chủ đặt min(1) cho phần tử của danh sách chữ: gửi dòng rỗng lên là nhận 400 khi lưu.
  it("bỏ dòng trống ở mọi danh sách chữ nhưng giữ mục rỗng", () => {
    const content = cv();
    content.coreCompetencies.push(" ");
    content.experiences[0].bullets.splice(1, 0, "");
    content.experiences.push({
      position: "",
      company: "",
      location: "",
      period: "",
      bullets: [""],
    });

    const clean = withoutEmptyLines(content);

    expect(clean.coreCompetencies).toEqual(["Hạch toán"]);
    expect(clean.experiences[0].bullets).toHaveLength(2);
    expect(clean.experiences).toHaveLength(2);
    expect(clean.experiences[1].bullets).toEqual([]);
  });
});

describe("swap", () => {
  it("đổi chỗ hai phần tử, chỉ số ngoài khoảng thì giữ nguyên", () => {
    expect(swap(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
    const list = ["a"];
    expect(swap(list, 0, 1)).toBe(list);
  });
});
