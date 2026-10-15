import { api } from "@/lib/axios";
import type { DashboardOverview } from "@/types";

export const dashboardService = {
  overview: () => api.get<DashboardOverview>("/dashboard").then((r) => r.data),
  skillGaps: () =>
    api
      .get<DashboardOverview["skillGaps"]>("/dashboard/skill-gaps")
      .then((r) => r.data),
};
