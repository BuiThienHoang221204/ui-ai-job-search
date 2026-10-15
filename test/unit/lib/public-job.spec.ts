import { describe, expect, test } from "vitest";
import { isGuestPath, portalName } from "@/lib/public-job";

describe("isGuestPath", () => {
  test("danh sách việc làm và chi tiết một tin mở cho khách", () => {
    expect(isGuestPath("/dashboard/jobs")).toBe(true);
    expect(isGuestPath("/dashboard/jobs/abc123")).toBe(true);
  });

  test("tra cứu lương mở cho khách, cả danh sách lẫn từng vị trí", () => {
    expect(isGuestPath("/dashboard/salary")).toBe(true);
    expect(isGuestPath("/dashboard/salary/it-software-backend-developer")).toBe(
      true,
    );
  });

  test("mọi trang khác của dashboard vẫn cần đăng nhập", () => {
    expect(isGuestPath("/dashboard")).toBe(false);
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
