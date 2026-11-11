import { describe, expect, test } from "vitest";
import { addRecent } from "@/lib/recent-searches";

describe("addRecent", () => {
  test("đưa từ khoá lên đầu, bỏ bản trùng không dấu và giữ tối đa 5 mục", () => {
    const list = ["backend", "Kế toán", "a", "b", "c"];

    expect(addRecent(list, "  ke toan ")).toEqual(["ke toan", "backend", "a", "b", "c"]);
    expect(addRecent(list, "mới")).toEqual(["mới", "backend", "Kế toán", "a", "b"]);
    expect(addRecent(list, "   ")).toBe(list);
  });
});
