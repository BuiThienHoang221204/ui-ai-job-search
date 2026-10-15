"use client";

import { matchesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { useJobDetail } from "@/hooks/use-job-detail";
import { keys } from "@/lib/query-keys";
import { jobOptionsOf } from "@/lib/job-options";

const MATCH_LIMIT = 50;

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
