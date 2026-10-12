import { expect, test } from "@playwright/test";

/**
 * Đơn chưa có CV → "Tạo CV cho tin này" phải tạo CV cho đúng TIN của đơn. Lỗi
 * cũ: gửi id của ĐƠN vào chỗ `jobId`, và gọi tạo đơn mới cho một đơn đã có nên
 * luôn nhận 409. CV đang viết thì không hiện nút, để không tạo trùng.
 *
 * Danh sách đơn được giả lập và lệnh tạo CV bị chặn lại, nên spec không gọi
 * model và không ghi gì vào database.
 */
test("tao CV cho don gui dung jobId cua tin", async ({ page }) => {
  const application = {
    id: "app-1",
    jobId: "job-1",
    status: "VIEWED",
    appliedAt: null,
    closedAt: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    job: {
      id: "job-1",
      title: "Kế toán tổng hợp",
      company: "Công ty Thử",
      companyLogo: null,
      location: "Hà Nội",
      salaryRaw: null,
      url: "https://example.test/job-1",
    },
    documents: [],
  };
  await page.route(/\/api\/applications(\?.*)?$/, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({
          json: { items: [application], total: 1, limit: 20, offset: 0 },
        })
      : route.fulfill({ status: 500, json: { message: "không được gọi" } }),
  );
  let body: Record<string, unknown> | null = null;
  await page.route(/\/api\/documents\/cv$/, (route) => {
    body = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({ json: { documentId: "doc-1", status: "PENDING" } });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/applications");
  await page.getByRole("button", { name: "Tạo CV cho tin này" }).click();

  await expect(page.getByText(/Đang viết CV cho tin này/)).toBeVisible();
  expect(body).toMatchObject({ jobId: "job-1" });
});

test("CV dang viet thi hien trang thai, khong hien nut tao", async ({
  page,
}) => {
  await page.route(/\/api\/applications(\?.*)?$/, (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: "app-1",
            jobId: "job-1",
            status: "VIEWED",
            appliedAt: null,
            closedAt: null,
            createdAt: "2026-10-01T00:00:00.000Z",
            updatedAt: "2026-10-01T00:00:00.000Z",
            job: {
              id: "job-1",
              title: "Kế toán tổng hợp",
              company: "Công ty Thử",
              companyLogo: null,
              location: "Hà Nội",
              salaryRaw: null,
              url: "https://example.test/job-1",
            },
            documents: [
              {
                id: "doc-1",
                jobId: "job-1",
                kind: "CV",
                title: "CV",
                status: "RUNNING",
                templateId: "classic",
                generatedAt: null,
              },
            ],
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    }),
  );

  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@aijob.local");
  await page.getByLabel("Mật khẩu").fill("Demo@12345");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/applications");
  await expect(page.getByText("Đang viết CV…")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tạo CV cho tin này" }),
  ).toHaveCount(0);
});
