"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { dashboardService } from "@/services";
import { keys } from "@/lib/query-keys";

/** Dữ liệu trang Tổng quan; mọi khối gọi chung hook này, React Query chỉ gửi một request. */
export function useDashboard() {
  return useApiQuery(keys.dashboard(), () => dashboardService.overview(), {
    errorMessage: "Không tải được dữ liệu tổng quan",
  });
}

/** Kỹ năng tin cùng ngành hay đòi mà hồ sơ chưa có, lấy riêng để trang Hồ sơ khỏi tải cả trang Tổng quan. */
export function useSkillGaps() {
  return useApiQuery(keys.skillGaps(), () => dashboardService.skillGaps(), {
    errorMessage: "Không tải được gợi ý kỹ năng",
  });
}
