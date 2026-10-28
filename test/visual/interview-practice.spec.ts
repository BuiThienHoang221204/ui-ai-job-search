import { expect, test, type Page } from "@playwright/test";
import { logIn } from "./support";

/**
 * Backend định vị câu hỏi theo số thứ tự trong mảng GỐC của bộ đề. Phần tử
 * hỏng (thiếu câu hỏi) bị giao diện bỏ đi, nên nếu đánh số lại sau khi lọc thì
 * câu trả lời được ghi vào nhầm câu mà không có lỗi nào báo. Bộ đề ở đây cố ý
 * mở đầu bằng một phần tử hỏng.
 *
 * Danh sách và bộ đề được giả lập, lệnh lưu bị chặn lại, nên spec không gọi
 * model và không ghi gì vào database.
 */
const JOB = {
  id: "job-1",
  title: "Kế toán tổng hợp",
  company: "Công ty Thử",
  companyLogo: null,
};

const PREP = {
  id: "prep-1",
  jobId: "job-1",
  job: JOB,
  status: "DONE",
  starAnswers: [
    { competency: "Phần tử hỏng, không có câu hỏi" },
    {
      competency: "Đối soát",
      question: "Kể về lần bạn tìm ra chênh lệch sổ sách?",
      situation: "Cuối quý lệch 40 triệu.",
      task: "Tôi phụ trách đối soát.",
      action: "Đối chiếu từng chứng từ.",
      result: "Tìm ra lỗi nhập trùng.",
    },
  ],
  toughQuestions: [],
  questionsToAsk: ["Đội kế toán có bao nhiêu người?"],
  talkingPoints: [],
  likelyProbes: [],
  modelId: "fake",
  generatedAt: "2026-10-10T00:00:00.000Z",
  failureKind: null,
  createdAt: "2026-10-10T00:00:00.000Z",
  updatedAt: "2026-10-10T00:00:00.000Z",
  practiced: 0,
  total: 1,
  answers: [],
  application: null,
};

async function login(page: Page) {
  await logIn(page, "demo@aijob.local");
}

test("tu tra loi luu dung so thu tu goc cua cau hoi", async ({ page }) => {
  await page.route(/\/api\/interview(\?.*)?$/, (route) =>
    route.fulfill({
      json: { items: [PREP], total: 1, limit: 15, offset: 0 },
    }),
  );
  await page.route(/\/api\/interview\/job-1$/, (route) =>
    route.fulfill({ json: PREP }),
  );
  let savedPath: string | null = null;
  let savedBody: unknown = null;
  await page.route(/\/api\/interview\/job-1\/answers\//, (route) => {
    savedPath = new URL(route.request().url()).pathname;
    savedBody = route.request().postDataJSON();
    return route.fulfill({
      json: {
        kind: "STAR",
        index: 1,
        answer: {
          text: "Tôi đối chiếu từng chứng từ.",
          feedback: null,
          feedbackStale: false,
          updatedAt: "2026-10-14T00:00:00.000Z",
        },
      },
    });
  });

  await login(page);
  await page.goto("/dashboard/interview");

  await page.getByRole("button", { name: "Tự trả lời" }).click();
  await page.getByRole("textbox").fill("Tôi đối chiếu từng chứng từ.");
  await page.getByRole("textbox").blur();

  await expect(page.getByText("Đã lưu")).toBeVisible({ timeout: 8000 });
  expect(savedPath).toBe("/api/interview/job-1/answers/star/1");
  expect(savedBody).toEqual({ text: "Tôi đối chiếu từng chứng từ." });
  await expect(page.getByText("1/1")).toBeVisible();
});

test("luyen cau nay mo phong van thu kem dung cau hoi", async ({ page }) => {
  await page.route(/\/api\/interview(\?.*)?$/, (route) =>
    route.fulfill({
      json: { items: [PREP], total: 1, limit: 15, offset: 0 },
    }),
  );
  await page.route(/\/api\/interview\/job-1$/, (route) =>
    route.fulfill({ json: PREP }),
  );

  await login(page);
  await page.goto("/dashboard/interview");
  await page.getByRole("button", { name: "Luyện câu này" }).click();

  await page.waitForURL(/\/dashboard\/interview\/job-1\/mock\?q=/);
  expect(new URL(page.url()).searchParams.get("q")).toBe(
    "Kể về lần bạn tìm ra chênh lệch sổ sách?",
  );
});
