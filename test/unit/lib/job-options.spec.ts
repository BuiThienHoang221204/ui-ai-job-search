import { describe, expect, test } from "vitest";
import type { JobMatchWithJob, JobRecord } from "@/types";
import { jobOptionsOf } from "@/lib/job-options";

const job = {
  id: "job-1",
  title: "Backend Developer",
  company: "Vexere",
} as JobRecord;
const match = (jobId: string, title: string) =>
  ({ jobId, job: { title, company: "Công ty A" } }) as JobMatchWithJob;

describe("jobOptionsOf", () => {
  test("tin đã cố định: chỉ một lựa chọn là đúng tin đó, không cần danh sách đã chấm", () => {
    expect(jobOptionsOf(job, null)).toEqual([
      { jobId: "job-1", title: "Backend Developer", company: "Vexere" },
    ]);
  });

  test("không cố định tin: lấy từ danh sách tin đã chấm điểm", () => {
    expect(
      jobOptionsOf(null, [match("a", "Kế toán"), match("b", "Giáo viên")]),
    ).toEqual([
      { jobId: "a", title: "Kế toán", company: "Công ty A" },
      { jobId: "b", title: "Giáo viên", company: "Công ty A" },
    ]);
  });

  test("còn đang tải thì trả null để phân biệt với danh sách rỗng", () => {
    expect(jobOptionsOf(undefined, undefined)).toBeNull();
    expect(jobOptionsOf(null, [])).toEqual([]);
  });
});
