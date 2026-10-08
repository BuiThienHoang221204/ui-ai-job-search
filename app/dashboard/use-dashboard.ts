"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { dashboardService } from "@/services";

/** Dữ liệu trang Tổng quan; mọi khối gọi chung hook này, React Query chỉ gửi một request. */
export function useDashboard() {
  return useApiQuery(["dashboard", "overview"], () => dashboardService.overview(), {
    errorMessage: "Không tải được dữ liệu tổng quan",
  });
}
