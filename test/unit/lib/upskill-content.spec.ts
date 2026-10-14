import { describe, expect, test } from "vitest";
import { parseSynthesisedGaps } from "@/lib/upskill-content";

describe("parseSynthesisedGaps", () => {
  test("đọc đủ ba trường", () => {
    const [gap] = parseSynthesisedGaps([
      {
        category: "tooling",
        gap: "Chưa quen quy trình CI/CD.",
        why: "Mọi tin đều yêu cầu tự chạy pipeline.",
      },
    ]);

    expect(gap).toEqual({
      category: "tooling",
      gap: "Chưa quen quy trình CI/CD.",
      why: "Mọi tin đều yêu cầu tự chạy pipeline.",
    });
  });

  /// Nhãn ngoài bốn nhãn đã định thì bỏ nhãn, GIỮ nội dung: khoảng trống vẫn có
  /// thật kể cả khi model phân loại sai.
  test("nhãn lạ thành null nhưng vẫn giữ nội dung", () => {
    const [gap] = parseSynthesisedGaps([
      { category: "khac", gap: "Thiếu kinh nghiệm fintech." },
    ]);

    expect(gap.category).toBeNull();
    expect(gap.gap).toBe("Thiếu kinh nghiệm fintech.");
  });

  test("bỏ khối không có nội dung khoảng trống", () => {
    expect(
      parseSynthesisedGaps([{ category: "soft", why: "Quan trọng." }]),
    ).toEqual([]);
  });
});
