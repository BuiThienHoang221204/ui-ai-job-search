"use client";

import { applicationsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";

const RECENT_VIEWED = 5;

/** Năm đơn "đã xem" gần nhất kèm tổng số, và tổng số đơn đã nộp — cho thẻ Đơn ứng tuyển ở trang Tổng quan. */
export function useRecentApplications() {
  const viewed = useApiQuery(
    keys.applicationRecent("VIEWED"),
    () => applicationsService.list({ limit: RECENT_VIEWED }, "VIEWED"),
    { errorMessage: "Không tải được đơn ứng tuyển" },
  );
  const applied = useApiQuery(
    keys.applicationRecent("APPLIED"),
    () => applicationsService.list({ limit: 1 }, "APPLIED"),
    { errorMessage: "Không tải được đơn ứng tuyển" },
  );
  return { viewed: viewed.data ?? null, appliedTotal: applied.data?.total ?? null };
}
