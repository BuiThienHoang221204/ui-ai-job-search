import { describe, expect, it } from "vitest";
import { closestIn, parentPath, renumberLines } from "@/lib/cv-frame";

describe("parentPath", () => {
  it("bỏ phần sau dấu chấm cuối", () => {
    expect(parentPath("experiences.0.bullets.2")).toBe("experiences.0.bullets");
    expect(parentPath("coreCompetencies.0")).toBe("coreCompetencies");
  });
});

describe("renumberLines", () => {
  // Thêm hay xoá một dòng ở giữa mà không đánh lại số thì gõ vào dòng sau sẽ ghi nhầm sang dòng khác trong bản nháp.
  it("đánh lại chỉ số liên tục theo thứ tự dòng", () => {
    const lines = ["a", "b", "c"].map(() => {
      const attrs: Record<string, string> = {};
      return {
        attrs,
        setAttribute: (name: string, value: string) => {
          attrs[name] = value;
        },
      };
    });
    const list = { querySelectorAll: () => lines } as unknown as Element;

    renumberLines(list, "experiences.1.bullets");

    expect(lines.map((line) => line.attrs["data-field"])).toEqual([
      "experiences.1.bullets.0",
      "experiences.1.bullets.1",
      "experiences.1.bullets.2",
    ]);
  });
});

describe("closestIn", () => {
  // Phần tử trong iframe thuộc realm khác: dò theo hình dạng, không dùng instanceof.
  it("dùng closest của chính phần tử, bỏ qua thứ không phải phần tử", () => {
    const found = { id: "x" };
    const node = { closest: () => found } as unknown as EventTarget;

    expect(closestIn(node, "[data-field]")).toBe(found);
    expect(closestIn({} as EventTarget, "[data-field]")).toBeNull();
    expect(closestIn(null, "[data-field]")).toBeNull();
  });
});
