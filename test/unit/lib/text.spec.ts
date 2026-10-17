import { describe, expect, test } from "vitest";
import { capitalize } from "@/lib/text";

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
