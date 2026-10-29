import { describe, expect, test } from "vitest";
import { parseDescription } from "@/lib/job-description";

describe("parseDescription", () => {
  test("gom các dòng gạch đầu dòng liền nhau thành một danh sách", () => {
    expect(parseDescription("- Mục A\n- Mục B\n- Mục C")).toEqual([
      { type: "list", items: ["Mục A", "Mục B", "Mục C"] },
    ]);
  });

  test("nhận tiêu đề mục: IN HOA, kết thúc ':', đánh số, và nhãn quen thuộc", () => {
    expect(parseDescription("MÔ TẢ CHUNG CÔNG VIỆC")).toEqual([
      { type: "heading", text: "MÔ TẢ CHUNG CÔNG VIỆC" },
    ]);
    expect(parseDescription("Responsibilities:")).toEqual([
      { type: "heading", text: "Responsibilities" },
    ]);
    expect(parseDescription("2.1. Lãnh đạo và điều hành")).toEqual([
      { type: "heading", text: "2.1. Lãnh đạo và điều hành" },
    ]);
    expect(parseDescription("Yêu cầu ứng viên")).toEqual([
      { type: "heading", text: "Yêu cầu ứng viên" },
    ]);
  });

  test("câu văn thường (kết thúc bằng dấu câu) là đoạn văn, không phải tiêu đề", () => {
    expect(
      parseDescription("Tốt nghiệp Đại học chuyên ngành kế toán."),
    ).toEqual([
      { type: "para", text: "Tốt nghiệp Đại học chuyên ngành kế toán." },
    ]);
  });

  test("bỏ dòng ngăn cách và dòng trống", () => {
    expect(parseDescription("Đoạn 1\n-----------------\n\nĐoạn 2")).toEqual([
      { type: "para", text: "Đoạn 1" },
      { type: "para", text: "Đoạn 2" },
    ]);
  });

  test("mô tả dạng HTML cũng ra cùng cấu trúc", () => {
    expect(
      parseDescription(
        "<p>Yêu cầu ứng viên:</p><ul><li>Kinh nghiệm 2 năm</li><li>Thành thạo Excel</li></ul>",
      ),
    ).toEqual([
      { type: "heading", text: "Yêu cầu ứng viên" },
      { type: "list", items: ["Kinh nghiệm 2 năm", "Thành thạo Excel"] },
    ]);
  });
});
