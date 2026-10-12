"use client";

import type { JobMatchWithJob, JobOption } from "@/types";
import type { JobRecord } from "@/services";
import { matchesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { useJobDetail } from "@/hooks/use-job-detail";
import { keys } from "@/lib/query-keys";

const MATCH_LIMIT = 50;

/** Danh sách tin cho ô chọn: khi tin đã cố định chỉ cần đúng tin đó, ngược lại là các tin đã chấm điểm. */
export function jobOptionsOf(
  fixedJob: JobRecord | null | undefined,
  matches: JobMatchWithJob[] | null | undefined,
): JobOption[] | null {
  if (fixedJob) {
    return [
      { jobId: fixedJob.id, title: fixedJob.title, company: fixedJob.company },
    ];
  }
  if (!matches) return null;
  return matches.map((match) => ({
    jobId: match.jobId,
    title: match.job.title,
    company: match.job.company,
  }));
}

/** Tin để chọn khi viết CV / thư; tin đã cố định thì đọc chung cache với trang chi tiết tin. `null` là đang tải. */
export function useJobOptions(fixedJobId: string | null) {
  const fixed = useJobDetail(fixedJobId ?? "", Boolean(fixedJobId));
  const list = useApiQuery(
    keys.matchList(MATCH_LIMIT),
    () => matchesService.list({ limit: MATCH_LIMIT }),
    {
      errorMessage: "Không tải được danh sách công việc",
      enabled: !fixedJobId,
    },
  );

  return {
    options: jobOptionsOf(fixed.data?.job, list.data?.items),
    error: fixedJobId ? fixed.error : list.error,
  };
}
