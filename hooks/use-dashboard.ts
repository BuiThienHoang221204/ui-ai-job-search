"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { dashboardService } from "@/services";
import { keys } from "@/lib/query-keys";

/** Dữ liệu trang Tổng quan; mọi khối gọi chung hook này. Hạn 5 giây: quay lại trang là tải mới, nhưng các khối con mount ngay sau lượt tải đầu không tải lại. */
export function useDashboard() {
  return useApiQuery(keys.dashboard(), () => dashboardService.overview(), {
    errorMessage: "Không tải được dữ liệu tổng quan",
    staleTime: 5_000,
  });
}

/** Kỹ năng tin cùng ngành hay đòi mà hồ sơ chưa có, lấy riêng để trang Hồ sơ khỏi tải cả trang Tổng quan. */
export function useSkillGaps() {
  return useApiQuery(keys.skillGaps(), () => dashboardService.skillGaps(), {
    errorMessage: "Không tải được gợi ý kỹ năng",
  });
}
