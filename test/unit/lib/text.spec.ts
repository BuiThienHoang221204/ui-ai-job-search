import { describe, expect, test } from "vitest";
import { capitalize, plainPreview } from "@/lib/text";

describe("capitalize", () => {
  test("viết hoa chữ đầu, kể cả chữ có dấu", () => {
    expect(capitalize("quyết toán thuế")).toBe("Quyết toán thuế");
    expect(capitalize("ưu tiên")).toBe("Ưu tiên");
  });

  test("từ đầu đã có chữ hoa hoặc không phải chữ thì giữ nguyên", () => {
    expect(capitalize("iOS")).toBe("iOS");
    expect(capitalize("Excel")).toBe("Excel");
    expect(capitalize("1A")).toBe("1A");
    expect(capitalize("")).toBe("");
  });
});

describe("plainPreview", () => {
  test("bỏ markdown và gộp xuống dòng cho đoạn xem trước", () => {
    expect(
      plainPreview("**Điểm mạnh:** 1. Kiến thức sâu\n2. Giao tiếp tốt"),
    ).toBe("Điểm mạnh: 1. Kiến thức sâu 2. Giao tiếp tốt");
    expect(plainPreview("- Mục A\n- Mục B")).toBe("Mục A Mục B");
    expect(plainPreview("Dùng `npm` và #tag")).toBe("Dùng npm và tag");
  });
});
