import type { DashboardOverview } from "@/types";
import { api } from "@/lib/axios";

export const dashboardService = {
  overview: () => api.get<DashboardOverview>("/dashboard").then((r) => r.data),
  skillGaps: () =>
    api
      .get<DashboardOverview["skillGaps"]>("/dashboard/skill-gaps")
      .then((r) => r.data),
};
