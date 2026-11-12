"use client";

import type { JobListParams, ShortlistView } from "@/types";
import { jobsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";

const PARAMS: Record<ShortlistView, JobListParams> = {
  newest: { scored: true, sort: "newest", limit: 6 },
  saved: { saved: true, limit: 6 },
};

/** Sáu tin cho một tab của "Việc đang chờ bạn": tin mới nhất trong ngành hoặc tin đã lưu; chỉ tải khi tab được mở. */
export function useJobShortlist(view: ShortlistView, enabled: boolean) {
  return useApiQuery(keys.jobList(PARAMS[view]), () => jobsService.list(PARAMS[view]), {
    errorMessage: "Không tải được danh sách tin",
    enabled,
  });
}
