import { api } from "@/lib/axios";
import type { CompanyBriefView } from "@/types";

export const companiesService = {
  briefForJob: (jobId: string) =>
    api
      .get<CompanyBriefView>(`/companies/brief/by-job/${jobId}`)
      .then((r) => r.data),
};
