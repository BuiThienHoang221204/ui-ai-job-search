import { describe, expect, test } from "vitest";
import { safeNextPath } from "@/utils/redirect";

describe("safeNextPath", () => {
  test.each([
    ["/dashboard/jobs?page=2#top", "/dashboard/jobs?page=2#top"],
    ["/dashboard", "/dashboard"],
    ["/dashboard/../dashboard/matches", "/dashboard/matches"],
  ])("giữ đường dẫn nội bộ %s", (raw, expected) => {
    expect(safeNextPath(raw, "/fallback")).toBe(expected);
  });

  // Hai dạng đầu từng lọt kiểm tra startsWith("/"): URL parser coi "\" là "/" và bỏ tab, thành //evil.com.
  test.each([
    "/\\evil.com",
    "/\t/evil.com",
    "//evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "dashboard",
    "",
  ])("trả fallback cho %j", (raw) => {
    expect(safeNextPath(raw, "/fallback")).toBe("/fallback");
  });

  test("không có tham số thì trả fallback", () => {
    expect(safeNextPath(null, "/dashboard")).toBe("/dashboard");
  });
});
