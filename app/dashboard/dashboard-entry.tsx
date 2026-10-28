"use client";

import { useSession } from "@/hooks/use-session";
import type { MarketOccupation } from "@/types";
import { DashboardView } from "./dashboard-view";
import { GuestHome } from "./guest-home";

/** `/dashboard`: người đã đăng nhập thấy Tổng quan, khách thấy trang chào. */
export function DashboardEntry({
  occupations,
  jobCount,
}: {
  occupations: MarketOccupation[];
  jobCount: number | null;
}) {
  const { user } = useSession();
  if (user) return <DashboardView />;
  return <GuestHome occupations={occupations} jobCount={jobCount} />;
}
