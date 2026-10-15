import { api } from "@/lib/axios";
import type { BriefQueued, CompanyBriefView } from "@/types";

export const companiesService = {
  briefForJob: (jobId: string) =>
    api
      .get<CompanyBriefView>(`/companies/brief/by-job/${jobId}`)
      .then((r) => r.data),

  refreshForJob: (jobId: string, force = false) =>
    api
      .post<BriefQueued>(`/companies/brief/by-job/${jobId}`, { force })
      .then((r) => r.data),
};
