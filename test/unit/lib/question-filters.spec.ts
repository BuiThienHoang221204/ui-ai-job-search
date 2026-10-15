import { describe, expect, test } from "vitest";
import { questionFilters } from "@/lib/question-filters";

describe("questionFilters", () => {
  test("chưa lọc gì (kể cả ô tìm chỉ có dấu cách) thì là null, để dùng lại dữ liệu server đã tải sẵn", () => {
    expect(questionFilters("", null, null, null)).toBeNull();
    expect(questionFilters("   ", null, null, null)).toBeNull();
  });

  test("có lọc thì trả đúng tham số gửi lên API, bỏ khoảng trắng thừa của ô tìm", () => {
    expect(questionFilters("  react ", "IT", null, "Khó")).toEqual({
      industry: "IT",
      type: undefined,
      difficulty: "Khó",
      q: "react",
    });
  });
});
