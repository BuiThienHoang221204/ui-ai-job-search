import { QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";
import { updateJobDetail, type JobDetailData } from "@/hooks/use-job-detail";
import { keys } from "@/lib/query-keys";

const detail = (): JobDetailData =>
  ({
    job: { id: "job-1", application: null },
    match: null,
  }) as unknown as JobDetailData;

describe("updateJobDetail", () => {
  test("sửa đúng tin trong cache mà không gọi lại API", () => {
    const client = new QueryClient();
    client.setQueryData(keys.job("job-1"), detail());

    updateJobDetail(client, "job-1", (data) => ({
      ...data,
      job: { ...data.job, application: { id: "app-1", status: "APPLIED" } },
    }));

    const data = client.getQueryData<JobDetailData>(keys.job("job-1"));
    expect(data?.job.application).toEqual({ id: "app-1", status: "APPLIED" });
    expect(client.getQueryState(keys.job("job-1"))?.isInvalidated).toBe(false);
  });

  test("tin chưa có trong cache thì không tạo ra bản ghi rỗng", () => {
    const client = new QueryClient();
    updateJobDetail(client, "job-2", (data) => data);
    expect(client.getQueryData(keys.job("job-2"))).toBeUndefined();
  });
});
