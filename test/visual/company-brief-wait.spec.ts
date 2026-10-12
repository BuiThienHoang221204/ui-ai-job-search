import { expect, test } from "@playwright/test";

/**
 * Lượt tìm hiểu công ty rơi về hàng đợi (stream hỏng) thì giao diện poll chờ
 * kết quả. Spec canh TRẦN thời gian chờ: quá 5 phút thì dừng poll và báo người
 * dùng bấm lại, thay vì poll mãi mãi khi việc nền đã chết.
 *
 * Mọi API của thẻ công ty đều giả lập, nên spec không gọi model và không ghi gì.
 */
test("tim hieu cong ty: qua 5 phut chua co ket qua thi dung poll", async ({
  page,
}) => {
  await page.clock.install();

  let polls = 0;
  await page.route(/\/api\/companies\/brief\/by-job\/[^/]+$/, (route) => {
    if (route.request().method() === "POST")
      return route.fulfill({ json: { queued: true } });
    polls += 1;
    return route.fulfill({
      json: {
        researchable: true,
        company: "Công ty Thử",
        brief: null,
        stale: false,
      },
    });
  });
  await page.route(/\/api\/companies\/brief\/by-job\/[^/]+\/stream$/, (route) =>
    route.fulfill({ status: 500, json: { message: "hỏng" } }),
  );

  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/jobs/demo_job_backend_001");
  await page.getByRole("button", { name: "Tìm hiểu công ty này" }).click();

  await page.clock.runFor(10_000);
  expect(polls).toBeGreaterThan(1);

  await page.clock.runFor(5 * 60_000 - 10_000 + 1_000);
  await expect(
    page.getByText(/Chưa có kết quả tìm hiểu công ty/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tìm hiểu công ty này" }),
  ).toBeVisible();

  const stopped = polls;
  await page.clock.runFor(30_000);
  expect(polls).toBe(stopped);
});
