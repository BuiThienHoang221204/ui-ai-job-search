import type { DashboardOverview } from "@/types";
import { api } from "@/lib/axios";

export const dashboardService = {
  overview: () => api.get<DashboardOverview>("/dashboard").then((r) => r.data),
};
