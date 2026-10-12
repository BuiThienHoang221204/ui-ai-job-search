import { describe, expect, test } from "vitest";
import {
  coreTitle,
  letterChecklist,
  mentions,
  wordCount,
} from "@/lib/letter-checklist";

const words = (n: number) => Array.from({ length: n }, () => "chữ").join(" ");

describe("letter-checklist", () => {
  test("đếm chữ theo khoảng trắng", () => {
    expect(wordCount("  Kính gửi   Vexere,\nTôi ứng tuyển ")).toBe(6);
  });

  test("dò tên công ty không phân biệt hoa thường và dấu", () => {
    expect(mentions("Kính gửi VEXERE, tôi mến vexere", "Vexere")).toBe(2);
    expect(mentions("Gửi Công ty Đại Phát", "cong ty dai phat")).toBe(1);
  });

  test("lõi chức danh bỏ tiền tố địa điểm và phần trong ngoặc", () => {
    expect(
      coreTitle("HCM – Junior Fullstack Developer (ReactJS + NodeJS)"),
    ).toBe("Junior Fullstack Developer");
  });

  test("mail đủ ý thì mọi mục đều đạt", () => {
    const { checks, words: count } = letterChecklist({
      kind: "APPLICATION_EMAIL",
      text: `Kính gửi Vexere, tôi ứng tuyển Junior Fullstack Developer. ${words(160)}`,
      subject: "Ứng tuyển Junior Fullstack Developer – Bùi Thiên Hoàng",
      company: "Vexere",
      title: "HCM – Junior Fullstack Developer (ReactJS + NodeJS)",
      hasJobCv: true,
    });
    expect(count).toBeGreaterThan(150);
    expect(checks.filter((check) => !check.ok)).toEqual([]);
  });

  test("bắt được câu giữ chỗ, thiếu tên công ty, quá ngắn, tiêu đề viết hoa và thiếu CV", () => {
    const { checks } = letterChecklist({
      kind: "APPLICATION_EMAIL",
      text: "Kính gửi [Tên người nhận], tôi muốn ứng tuyển.",
      subject: "UNG TUYEN",
      company: "Vexere",
      title: "Backend Developer",
      hasJobCv: false,
    });
    expect(
      checks.filter((check) => !check.ok).map((check) => check.id),
    ).toEqual(["company", "title", "placeholder", "length", "subject", "cv"]);
  });

  test("thư PDF dùng khoảng 250–400 chữ", () => {
    const { range } = letterChecklist({
      kind: "COVER_LETTER",
      text: words(300),
      subject: null,
      company: null,
      title: null,
      hasJobCv: true,
    });
    expect(range).toEqual([250, 400]);
  });
});
