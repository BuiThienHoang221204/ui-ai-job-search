import { QueryClient, type QueryKey } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";
import { invalidateAfter, keys, type WriteAction } from "@/lib/query-keys";

const SEEDED: Record<string, QueryKey> = {
  jobList: keys.jobList({ scored: true }),
  jobFilters: keys.jobFilters(),
  job: keys.job("job-1"),
  profile: keys.profile(),
  profileCv: keys.profileCv(),
  dashboard: keys.dashboard(),
  skillGaps: keys.skillGaps(),
  applications: keys.applicationList("ALL", 0),
};

/** Tên các query bị đánh dấu cũ sau một thao tác ghi. */
function invalidatedBy(action: WriteAction): string[] {
  const client = new QueryClient();
  for (const key of Object.values(SEEDED)) client.setQueryData(key, {});
  invalidateAfter(client, action);
  return Object.entries(SEEDED)
    .filter(([, key]) => client.getQueryState(key)?.isInvalidated)
    .map(([name]) => name);
}

describe("invalidateAfter", () => {
  test("chấm điểm xong: làm mới danh sách và tổng quan, không tải lại tin vừa chấm (đã ghi thẳng cache)", () => {
    expect(invalidatedBy("scoreJob")).toEqual(["jobList", "dashboard"]);
  });

  test("lưu tin: tải lại danh sách và tổng quan, KHÔNG tải lại chi tiết tin (đã sửa thẳng cache) hay bộ đếm thanh lọc", () => {
    expect(invalidatedBy("saveJob")).toEqual(["jobList", "dashboard"]);
  });

  test("đổi trạng thái đơn: tải lại danh sách (lọc đã ứng tuyển), không tải lại mọi chi tiết tin", () => {
    expect(invalidatedBy("applicationStatus")).toEqual([
      "jobList",
      "dashboard",
      "applications",
    ]);
  });

  test("tạo tài liệu: tổng quan cũng đếm CV và thư nên được làm mới", () => {
    expect(invalidatedBy("createDocument")).toEqual(["dashboard"]);
  });

  test("chọn ngành lần đầu: tải lại hồ sơ, tổng quan, khoảng trống kỹ năng và danh sách", () => {
    expect(invalidatedBy("quickStart")).toEqual([
      "jobList",
      "profile",
      "dashboard",
      "skillGaps",
    ]);
  });

  test("lưu hồ sơ: không tải lại hồ sơ (đã có sẵn từ PUT) và không tải lại bản đọc CV", () => {
    expect(invalidatedBy("saveProfile")).toEqual([
      "jobList",
      "dashboard",
      "skillGaps",
    ]);
  });

  test("lưu từ bản đọc CV: tải lại hồ sơ và CV gần nhất", () => {
    expect(invalidatedBy("applyCvDraft")).toEqual([
      "jobList",
      "profile",
      "profileCv",
      "dashboard",
      "skillGaps",
    ]);
  });
});
