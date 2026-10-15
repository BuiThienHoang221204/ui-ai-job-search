import type { QueryClient } from "@tanstack/react-query";
import type { JobDetailData } from "@/types";
import { invalidateAfter, keys } from "@/lib/query-keys";

/** Sửa thẳng dữ liệu chi tiết tin trong cache, khỏi tải lại cả tin sau một thao tác nhỏ. */
export function updateJobDetail(
  client: QueryClient,
  jobId: string,
  update: (data: JobDetailData) => JobDetailData,
): void {
  client.setQueryData<JobDetailData>(keys.job(jobId), (current) =>
    current ? update(current) : current,
  );
}

/** Sau khi lưu/bỏ lưu: sửa cờ `saved` trong cache chi tiết tin, chỉ tải lại danh sách và dashboard. */
export function afterSaveJob(
  client: QueryClient,
  jobId: string,
  saved: boolean,
): void {
  updateJobDetail(client, jobId, (data) => ({
    ...data,
    job: { ...data.job, saved },
  }));
  invalidateAfter(client, "saveJob");
}
