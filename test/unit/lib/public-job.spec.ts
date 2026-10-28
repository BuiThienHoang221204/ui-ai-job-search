import { describe, expect, test } from "vitest";
import { isGuestPath, jobShareUrl, portalName } from "@/lib/public-job";

describe("isGuestPath", () => {
  test("danh sách việc làm và chi tiết một tin mở cho khách", () => {
    expect(isGuestPath("/dashboard/jobs")).toBe(true);
    expect(isGuestPath("/dashboard/jobs/abc123")).toBe(true);
    expect(isGuestPath("/dashboard/market")).toBe(true);
    expect(isGuestPath("/dashboard/market/cong-nghe-thong-tin")).toBe(true);
  });

  test("phân tích CV mở cho khách, trang con của nó thì không", () => {
    expect(isGuestPath("/dashboard/cv-check")).toBe(true);
    expect(isGuestPath("/dashboard/cv-check/abc")).toBe(false);
  });

  test("tra cứu lương mở cho khách, cả danh sách lẫn từng vị trí", () => {
    expect(isGuestPath("/dashboard/salary")).toBe(true);
    expect(isGuestPath("/dashboard/salary/it-software-backend-developer")).toBe(
      true,
    );
  });

  test("Chính sách bảo mật và Điều khoản sử dụng mở cho khách", () => {
    expect(isGuestPath("/dashboard/chinh-sach-bao-mat")).toBe(true);
    expect(isGuestPath("/dashboard/dieu-khoan-su-dung")).toBe(true);
  });

  test("/dashboard mở cho khách: khách thấy trang chào, không bị đẩy sang đăng nhập", () => {
    expect(isGuestPath("/dashboard")).toBe(true);
  });

  test("mọi trang khác của dashboard vẫn cần đăng nhập", () => {
    expect(isGuestPath("/dashboard/profile")).toBe(false);
    expect(isGuestPath("/dashboard/cv-optimizer")).toBe(false);
    expect(isGuestPath("/dashboard/jobs/abc123/match")).toBe(false);
    expect(isGuestPath("/dashboard/jobsx")).toBe(false);
  });
});

describe("portalName", () => {
  test("portal đã biết có tên hiển thị, portal lạ giữ nguyên khoá", () => {
    expect(portalName("topcv")).toBe("TopCV");
    expect(portalName("nguon-moi")).toBe("nguon-moi");
  });
});

describe("jobShareUrl", () => {
  test("mở thẳng tin trong danh sách việc làm", () => {
    expect(jobShareUrl("https://careelot.vn", "abc123")).toBe(
      "https://careelot.vn/dashboard/jobs?job=abc123",
    );
  });

  test("kèm mã giới thiệu khi có", () => {
    expect(jobShareUrl("https://careelot.vn", "abc123", "MOI99")).toBe(
      "https://careelot.vn/dashboard/jobs?job=abc123&ref=MOI99",
    );
  });
});
