"use client";

import { jobsService } from "@/services";
import { keys } from "@/lib/query-keys";
import { useApiQuery } from "@/hooks/use-api-query";

/** Danh mục bộ lọc việc làm (tỉnh, ngành, từ xa kèm số tin); mọi component gọi cùng hook, TanStack gộp thành một request. */
export function useJobFilters() {
  return useApiQuery(keys.jobFilters(), jobsService.filters, {
    errorMessage: "Không tải được danh mục bộ lọc",
    staleTime: Infinity,
  });
}
