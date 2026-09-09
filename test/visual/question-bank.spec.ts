import { expect, test } from "@playwright/test";

/**
 * Mở ngân hàng câu hỏi bằng tài khoản NGOÀI ngành IT.
 *
 * Cố ý không dùng `demo@` (backend developer): trang này phục vụ mọi ngành, và
 * đo trên kho thật thì 58% câu thuộc IT — mở bằng tài khoản IT sẽ không thấy
 * được bộ lọc ngành có làm việc hay không.
 */
async function moNganHang(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("ketoan@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/interview/questions");
  await expect(
    page.getByRole("heading", { name: "Ngân hàng câu hỏi" }),
  ).toBeVisible({ timeout: 30_000 });
}

test("loc theo nganh thi so cau doi theo", async ({ page }) => {
  await moNganHang(page);

  const dem = page.getByText(/câu hỏi khớp bộ lọc/);
  await expect(dem).toBeVisible();
  const truoc = await dem.textContent();

  await page.getByRole("button", { name: /Mọi ngành nghề/ }).click();
  await page.getByRole("option", { name: /Kế toán/ }).click();
  await expect(dem).not.toHaveText(truoc ?? "", { timeout: 15_000 });

  const sau = await dem.textContent();
  expect(sau).not.toBe(truoc);
});

test("cau hanh vi khong hien dap an mau", async ({ page }) => {
  await moNganHang(page);

  await page.getByRole("button", { name: /Mọi loại câu hỏi/ }).click();
  await page.getByRole("option", { name: /Hành vi/ }).click();
  await page.waitForTimeout(1500);

  const the = page.locator("[aria-expanded]").first();
  await the.click();

  // Đáp án sinh LƯỜI: bung thẻ ra chưa gọi model, phải bấm nút mới gọi.
  await page.getByRole("button", { name: "Xem gợi ý trả lời" }).click();

  await expect(page.getByText(/Câu này không có đáp án mẫu/)).toBeVisible({
    timeout: 120_000,
  });
});
