"use client";

import { profileDraftService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiErrorStatus } from "@/lib/axios";
import { keys } from "@/lib/query-keys";

/** Bản đọc CV gần nhất; chưa tải CV nào (404) thì là `null`, lỗi khác vẫn ném ra. */
export const fetchLatestCv = () =>
  profileDraftService.latest().catch((err: unknown) => {
    if (apiErrorStatus(err) === 404) return null;
    throw err;
  });

/** Bản đọc CV gần nhất, mọi trang đọc chung một cache `keys.profileCv()`. */
export function useLatestCv() {
  return useApiQuery(keys.profileCv(), fetchLatestCv, {
    errorMessage: "Không tải được CV gần nhất",
  });
}
