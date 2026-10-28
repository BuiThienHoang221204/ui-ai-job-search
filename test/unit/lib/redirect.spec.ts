import { describe, expect, test } from "vitest";
import { authEntryPath, safeNextPath } from "@/lib/redirect";

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

describe("authEntryPath", () => {
  test("giữ next và mã giới thiệu của đường dẫn cũ", () => {
    expect(
      authEntryPath("register", { ref: "ABC123", next: "/dashboard/jobs" }),
    ).toBe("/dashboard?auth=register&next=%2Fdashboard%2Fjobs&ref=ABC123");
  });

  test("bỏ tham số lạ và tham số lặp", () => {
    expect(authEntryPath("login", { utm: "x", next: ["/a", "/b"] })).toBe(
      "/dashboard?auth=login",
    );
  });
});
