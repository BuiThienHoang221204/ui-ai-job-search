"use client";

import { jobsService } from "@/services";
import { keys } from "@/lib/query-keys";
import { useApiQuery } from "@/hooks/use-api-query";
import { useDebounce } from "@/hooks/use-debounce";

const SUGGEST_DEBOUNCE_MS = 200;
const MIN_CHARS = 2;

/** Gợi ý chức danh và công ty cho ô tìm việc; chỉ gọi API khi đã gõ từ 2 ký tự. */
export function useJobSuggestions(query: string) {
  const debounced = useDebounce(query.trim(), SUGGEST_DEBOUNCE_MS);
  return useApiQuery(
    keys.jobSuggest(debounced),
    () => jobsService.suggest(debounced),
    {
      errorMessage: "Không tải được gợi ý",
      enabled: debounced.length >= MIN_CHARS,
      staleTime: 60_000,
      keepPrevious: true,
    },
  );
}
