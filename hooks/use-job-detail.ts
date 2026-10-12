"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { JobMatchDetail, JobRecord } from "@/services";
import { jobsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";

export interface JobDetailData {
  job: JobRecord;
  match: JobMatchDetail | null;
}

/** Dữ liệu chi tiết một tin (tin, điểm, đơn đã nộp); mọi nơi cần một tin đọc chung query này nên chỉ tốn một request. */
export function useJobDetail(jobId: string, enabled = true) {
  return useApiQuery<JobDetailData>(
    keys.job(jobId),
    async () => {
      const job = await jobsService.get(jobId);
      return { job, match: job.match };
    },
    { errorMessage: "Không tải được thông tin công việc", enabled },
  );
}

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
