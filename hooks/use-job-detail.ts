"use client";

import type { JobDetailData } from "@/types";
import { jobsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { toGuestJobRecord } from "@/lib/adapters";
import { useSession } from "@/hooks/use-session";

async function loadJobDetail(
  jobId: string,
  signedIn: boolean,
): Promise<JobDetailData> {
  if (signedIn) {
    const job = await jobsService.get(jobId);
    return { job, match: job.match };
  }
  const job = await jobsService.publicGet(jobId);
  return { job: toGuestJobRecord(job), match: null };
}

/** Dữ liệu chi tiết một tin (tin, điểm, đơn đã nộp); mọi nơi cần một tin đọc chung query này nên chỉ tốn một request. Khách chưa đăng nhập đọc bản công khai. */
export function useJobDetail(jobId: string, enabled = true) {
  const { user } = useSession();
  return useApiQuery<JobDetailData>(
    user ? keys.job(jobId) : keys.publicJob(jobId),
    () => loadJobDetail(jobId, Boolean(user)),
    { errorMessage: "Không tải được thông tin công việc", enabled },
  );
}
