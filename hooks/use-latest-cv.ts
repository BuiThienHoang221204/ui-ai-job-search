"use client";

import { profileDraftService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";

/** Bản đọc CV gần nhất, mọi trang đọc chung một cache `keys.profileCv()`. */
export function useLatestCv() {
  return useApiQuery(keys.profileCv(), profileDraftService.latestOrNull, {
    errorMessage: "Không tải được CV gần nhất",
  });
}
