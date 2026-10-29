import { describe, expect, test } from "vitest";
import { capitalize, htmlToText, plainPreview } from "@/lib/text";

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

describe("htmlToText", () => {
  test("đổi <br>, </p> thành xuống dòng và giải mã &nbsp;", () => {
    expect(
      htmlToText("<p>1, Hạch toán<br>&nbsp;&nbsp;Theo dõi công nợ.</p>"),
    ).toBe("1, Hạch toán\nTheo dõi công nợ.");
  });

  test("<li> thành gạch đầu dòng, bỏ các thẻ còn lại", () => {
    expect(
      htmlToText(
        "<ul><li>Độ tuổi 25 – 40,</li><li>Kinh nghiệm 2 năm</li></ul>",
      ),
    ).toBe("• Độ tuổi 25 – 40,\n• Kinh nghiệm 2 năm");
  });

  test("giải mã entity số và không render thẻ như HTML", () => {
    expect(htmlToText("A &amp; B&#160;C")).toBe("A & B C");
    expect(htmlToText("&lt;script&gt;")).toBe("<script>");
  });

  test("văn bản thường không có thẻ thì giữ nguyên nội dung", () => {
    expect(htmlToText("Mô tả công việc bình thường.")).toBe(
      "Mô tả công việc bình thường.",
    );
  });
});
