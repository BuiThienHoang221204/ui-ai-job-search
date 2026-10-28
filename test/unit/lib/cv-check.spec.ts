import { describe, expect, test } from "vitest";
import { gradeOf, pagesOfText, statusOf } from "@/lib/cv-check";

describe("statusOf", () => {
  test.each([
    [15, 15, "pass"],
    [10, 15, "warn"],
    [3, 20, "fail"],
    [0, 5, "fail"],
  ] as const)("%i/%i là %s", (earned, max, status) => {
    expect(statusOf(earned, max)).toBe(status);
  });
});

describe("gradeOf", () => {
  test.each([
    [85, "Tốt"],
    [70, "Khá"],
    [50, "Trung bình"],
    [49, "Cần sửa nhiều"],
  ])("%i điểm là %s", (score, grade) => {
    expect(gradeOf(score)).toBe(grade);
  });
});

describe("pagesOfText", () => {
  test("ước số trang theo độ dài chữ, ít nhất 1 và nhiều nhất 10", () => {
    expect(pagesOfText("ngắn")).toBe(1);
    expect(pagesOfText("a".repeat(7_001))).toBe(3);
    expect(pagesOfText("a".repeat(100_000))).toBe(10);
  });
});
