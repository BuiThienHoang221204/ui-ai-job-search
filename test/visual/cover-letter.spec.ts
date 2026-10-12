import { expect, test } from "@playwright/test";

/**
 * Trang Thư xin việc: chọn loại thư đổi nhãn nút viết, và mở một thư đã viết
 * thì hiện cột "Trước khi gửi".
 *
 * Spec này KHÔNG bấm nút viết: mỗi lần bấm là một lượt gọi model thật trên
 * database DEV.
 */
test("trang thu xin viec: chon loai thu va mo mot thu da viet", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cover-letter");
  await expect(page.getByRole("heading", { name: "Thư của bạn" })).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByRole("button", { name: "Viết mail bằng AI" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Thư xin việc \(PDF\)/ }).click();
  await expect(
    page.getByRole("button", { name: "Viết thư bằng AI" }),
  ).toBeVisible();

  await page.screenshot({
    path: "test/visual/screenshots/cover-letter-home.png",
    fullPage: true,
  });

  const opened = page.locator("a[href*='cover-letter?doc=']").first();
  test.skip((await opened.count()) === 0, "Tài khoản demo chưa có thư nào");
  await opened.click();
  await expect(
    page.getByRole("heading", { name: /Trước khi gửi/ }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/chữ · nên \d+–\d+/).first()).toBeVisible();

  await page.screenshot({
    path: "test/visual/screenshots/cover-letter-workspace.png",
    fullPage: true,
  });
});
