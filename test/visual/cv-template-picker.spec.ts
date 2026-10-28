import { expect, test } from "@playwright/test";
import { logIn } from "./support";

/**
 * Dải chọn mẫu nằm ở đầu khu sửa CV (`?doc=`), chỉ hiện SAU KHI mở một CV đã
 * sinh xong. Vào thẳng trang thì chưa có gì để chọn mẫu cho.
 *
 * Spec này KHÔNG bấm Lưu: nó chạy trên database DEV, nên mọi thao tác ghi sẽ sửa
 * dữ liệu thật của người dùng.
 */
test("kho chon mau CV hien sau khi mo mot CV da tao", async ({ page }) => {
  await logIn(page, "ketoan@aijob.local");

  await page.goto("/dashboard/cv-optimizer");
  await expect(page.getByRole("heading", { name: "CV của bạn" })).toBeVisible({
    timeout: 30_000,
  });

  await page.locator("a[href*='?doc=']").first().click();
  await expect(page.locator('iframe[title="Xem trước CV"]')).toBeVisible({
    timeout: 30_000,
  });

  await expect(page.getByRole("button", { name: /Tiêu chuẩn/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Trang trọng/ })).toBeVisible();
  await expect(page.frameLocator("iframe").locator("body")).toBeVisible();

  // Chụp RIÊNG iframe: ảnh fullPage của Playwright không vẽ nội dung iframe,
  // nên khung xem trước sẽ ra một ô trắng và trông y như tính năng hỏng.
  await page.locator("iframe").scrollIntoViewIfNeeded();
  await page.locator("iframe").screenshot({
    path: "test/visual/screenshots/cv-template-xem-truoc.png",
  });
});
