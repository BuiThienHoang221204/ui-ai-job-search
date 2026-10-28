import { describe, expect, test } from "vitest";
import { isMultiColumn, type PdfTextItem } from "@/lib/pdf-browser";

const WIDTH = 595;

const line = (x: number, y: number, text = "Xây dựng API thanh toán") => ({
  x,
  y,
  width: text.length * 5,
  text,
});

describe("isMultiColumn", () => {
  test("một cột có ngày căn phải và tiêu đề căn giữa thì không tính là nhiều cột", () => {
    const items: PdfTextItem[] = [
      line(250, 800, "Nguyễn Văn An"),
      line(230, 780, "Kinh nghiệm"),
      line(220, 500, "Học vấn"),
    ];
    for (let row = 0; row < 30; row++) items.push(line(40, 760 - row * 14));
    for (const y of [760, 676, 592]) items.push(line(470, y, "03/2024 – nay"));
    expect(isMultiColumn(items, WIDTH)).toBe(false);
  });

  test("thanh bên cạnh cột chính thì là nhiều cột, kể cả khi dòng hai cột không thẳng hàng", () => {
    const items: PdfTextItem[] = [];
    for (let row = 0; row < 20; row++) {
      items.push(line(40, 780 - row * 16, "Kỹ năng"));
      items.push(line(200, 775 - row * 14));
    }
    expect(isMultiColumn(items, WIDTH)).toBe(true);
  });

  test("bảng hai cột cùng hàng thì là nhiều cột", () => {
    const items: PdfTextItem[] = [];
    for (let row = 0; row < 12; row++) {
      items.push(line(40, 780 - row * 16, "Mục"));
      items.push(line(250, 780 - row * 16));
    }
    expect(isMultiColumn(items, WIDTH)).toBe(true);
  });
});
