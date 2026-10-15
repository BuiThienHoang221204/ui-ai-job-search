import { expect, test, type APIRequestContext } from "@playwright/test";

/** Id của tin mới nhất, lấy từ API công khai. */
async function firstJobId(request: APIRequestContext): Promise<string> {
  const response = await request.get(
    "http://localhost:4000/api/public/jobs?limit=1",
  );
  const body = (await response.json()) as { items: { id: string }[] };
  return body.items[0].id;
}

test("khach vao thang trang viec lam, khong thay luong va nut luu", async ({
  page,
}) => {
  await page.goto("/dashboard/jobs");

  const list = page.getByTestId("job-list-pane");
  await expect(list.getByText("Đăng nhập để xem lương").first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(list.getByRole("button", { name: "Lưu việc làm" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: "Tạo tài khoản" })).toBeVisible();

  await list.locator("li button").first().click();

  await expect(page).toHaveURL(/\/dashboard\/jobs\?job=/);
  await expect(
    page.getByTestId("job-detail-pane").getByText(/Đọc tin đầy đủ trên/),
  ).toBeVisible();
});

test("khach mo link tin dang chon thi thay du cac khoi, bam nut thi sang dang nhap", async ({
  page,
  request,
}) => {
  const id = await firstJobId(request);

  await page.goto(`/dashboard/jobs?job=${id}`);

  const detail = page.getByTestId("job-detail-pane");
  await expect(detail.getByText(/Đọc tin đầy đủ trên/)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page).toHaveURL(new RegExp(`/dashboard/jobs\\?job=${id}$`));
  await expect(
    detail.getByText("Chưa chấm điểm phù hợp cho công việc này"),
  ).toBeVisible();
  await expect(detail.getByText("Tối ưu CV cho tin này")).toBeVisible();
  await expect(detail.getByText("Đăng nhập để xem lương")).toBeVisible();
  await expect(detail.getByText(/có trong hồ sơ/)).toHaveCount(0);
  await expect(detail.getByText(/Đáp ứng \d+\/\d+ bắt buộc/)).toHaveCount(0);

  await detail.getByRole("button", { name: "Ứng tuyển ngay" }).click();

  await expect(page).toHaveURL(
    `/login?next=${encodeURIComponent(`/dashboard/jobs/${id}`)}`,
  );
});

test("khach mo trang chi tiet rieng cua tin", async ({ page, request }) => {
  const id = await firstJobId(request);

  await page.goto(`/dashboard/jobs/${id}`);

  await expect(page.getByText(/Đọc tin đầy đủ trên/)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page).toHaveURL(new RegExp(`/dashboard/jobs/${id}$`));
});

test("khach bam sang trang khac cua dashboard thi bi dua ve dang nhap", async ({
  page,
}) => {
  await page.goto("/dashboard/jobs");
  await expect(page.getByTestId("job-list-pane")).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Tối ưu CV" }).first().click();

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fcv-optimizer/, {
    timeout: 15_000,
  });
});

test("khach bam Tra cuu luong o thanh ben thi xem duoc, khong bi dua ve dang nhap", async ({
  page,
}) => {
  await page.goto("/dashboard/jobs");
  await expect(page.getByTestId("job-list-pane")).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Tra cứu lương" }).first().click();

  await expect(page).toHaveURL(/\/dashboard\/salary$/);
  await expect(
    page.getByRole("heading", { name: "Tra cứu lương" }),
  ).toBeVisible({ timeout: 15_000 });
});

test("nguoi da dang nhap thay ban day du cua tin", async ({
  page,
  request,
}) => {
  const id = await firstJobId(request);

  await page.goto("/login");
  await page.getByLabel("Email").fill("ketoan@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto(`/dashboard/jobs?job=${id}`);

  const detail = page.getByTestId("job-detail-pane");
  await expect(
    detail.getByRole("button", { name: "Ứng tuyển ngay" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Đăng nhập để xem lương")).toHaveCount(0);
});
