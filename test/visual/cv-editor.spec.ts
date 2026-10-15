import { expect, test } from "@playwright/test";

/** Mở CV đầu tiên trong kho tài liệu của tài khoản kế toán. */
async function moCv(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("ketoan@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/cv-optimizer");
  await page.locator("a[href*='?doc=']").first().click();
  await expect(page.locator('iframe[title="Xem trước CV"]')).toBeVisible({
    timeout: 30_000,
  });
}

test("go thang len CV thi hien nut Luu va luu duoc", async ({ page }) => {
  await moCv(page);

  const frame = page.frameLocator('iframe[title="Xem trước CV"]');
  const gioiThieu = frame.locator('[data-field="profileStatement"]');
  await expect(gioiThieu).toBeVisible({ timeout: 15_000 });

  await gioiThieu.click();
  await page.keyboard.press("ControlOrMeta+A");
  // Chuỗi mới mỗi lần chạy: gõ lại đúng chữ đã lưu thì bản nháp không đổi và nút Lưu không hiện.
  const chu = `CHU-VUA-SUA-${Date.now()}`;
  await page.keyboard.type(chu);

  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(gioiThieu).toHaveText(chu, {
    timeout: 15_000,
  });

  await page.locator("iframe").scrollIntoViewIfNeeded();
  await page.locator("iframe").screenshot({
    path: "test/visual/screenshots/cv-editor-sua-chu.png",
  });
});

test("phan dau CV sua duoc ngay tren trang", async ({ page }) => {
  await moCv(page);

  const frame = page.frameLocator('iframe[title="Xem trước CV"]');
  const chucDanh = frame.locator('[data-field="identity.title"]');
  await expect(chucDanh).toBeVisible({ timeout: 15_000 });

  await chucDanh.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("CHUC-DANH-TRONG-TEST");

  // Không bấm lưu: chỉ kiểm phần đầu sửa được và làm bản nháp đổi, giữ nguyên dữ liệu dev cho các spec khác.
  await expect(chucDanh).toHaveText("CHUC-DANH-TRONG-TEST");
  await expect(
    page.getByRole("button", { name: "Lưu thay đổi" }),
  ).toBeVisible();
});

test("enter o gach dau dong thi them dong moi ngay ben duoi", async ({
  page,
}) => {
  await moCv(page);

  const frame = page.frameLocator('iframe[title="Xem trước CV"]');
  const dongDau = frame.locator('[data-field="experiences.0.bullets.0"]');
  await expect(dongDau).toBeVisible({ timeout: 15_000 });

  await dongDau.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.type("DONG-MOI-TRONG-TEST");

  await expect(
    frame.locator('[data-field="experiences.0.bullets.1"]'),
  ).toHaveText("DONG-MOI-TRONG-TEST");
});

test("re chuot vao mot muc thi hien thanh cong cu cua muc do", async ({
  page,
}) => {
  await moCv(page);

  const frame = page.frameLocator('iframe[title="Xem trước CV"]');
  await frame.locator("[data-section='experience']").hover();

  await expect(
    page.getByRole("button", { name: "Thêm kinh nghiệm" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thêm kinh nghiệm" }).click();

  // Mục mới chưa có chữ: chỉ hiện chữ gợi ý ở chế độ sửa, không vào bản PDF.
  await expect(
    frame.locator('[data-entry] [data-placeholder="Tên công ty"]:empty'),
  ).toHaveCount(1, { timeout: 15_000 });
});

test("tab Thiet ke doi co chu thi trang CV doi theo", async ({ page }) => {
  await moCv(page);

  const frame = page.frameLocator('iframe[title="Xem trước CV"]');
  await expect(frame.locator("[data-section]").first()).toBeVisible({
    timeout: 15_000,
  });
  const coChu = () =>
    frame.locator("body").evaluate((body) => getComputedStyle(body).fontSize);
  const truoc = parseFloat(await coChu());

  await page.getByRole("tab", { name: "Thiết kế" }).click();
  await page.getByRole("button", { name: "Lớn", exact: true }).click();

  await expect
    .poll(async () => parseFloat(await coChu()))
    .toBeGreaterThan(truoc);
  await expect(
    page.getByRole("button", { name: "Lưu thay đổi" }),
  ).toBeVisible();
});

test("mau nhan nam o tab Thiet ke va doi mau tren trang CV", async ({
  page,
}) => {
  await moCv(page);

  await page.getByRole("button", { name: /Tiêu chuẩn/ }).click();
  await expect(page.getByText("Màu nhấn")).toBeHidden();

  await page.getByRole("tab", { name: "Thiết kế" }).click();
  await page.getByRole("button", { name: "Màu #9d174d" }).click();

  const frame = page.frameLocator('iframe[title="Xem trước CV"]');
  await expect
    .poll(() => frame.locator("html").evaluate((html) => html.outerHTML), {
      timeout: 15_000,
    })
    .toContain("#9d174d");
  await expect(
    page.getByRole("button", { name: "Màu #9d174d" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("an mot muc thi muc do bien khoi ban xem truoc", async ({ page }) => {
  await moCv(page);

  const frame = page.frameLocator("iframe");
  await expect(frame.getByText("HỌC VẤN")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("tab", { name: "Bố cục" }).click();
  await page.getByRole("button", { name: "Ẩn Học vấn khỏi CV" }).click();

  await expect(frame.getByText("HỌC VẤN")).toBeHidden({ timeout: 15_000 });
  await expect(
    page.getByRole("button", { name: "Đưa Học vấn lại vào CV" }),
  ).toBeVisible();
});

test("doi thu tu muc bang nut mui ten", async ({ page }) => {
  await moCv(page);

  await page.getByRole("tab", { name: "Bố cục" }).click();

  const tieuDe = page.locator("div:has(> button[aria-label^='Ẩn']) > span");
  await expect(tieuDe.first()).toHaveText("Giới thiệu");

  await page
    .getByRole("button", { name: "Đưa Năng lực chính lên trên" })
    .first()
    .click();

  await expect(tieuDe.first()).toHaveText("Năng lực chính");
  await expect(tieuDe.nth(1)).toHaveText("Giới thiệu");
});

test("dai chon mau nam cung trang voi mot khung xem truoc", async ({
  page,
}) => {
  await moCv(page);

  await expect(page.getByRole("button", { name: /Trang trọng/ })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(1);
});
