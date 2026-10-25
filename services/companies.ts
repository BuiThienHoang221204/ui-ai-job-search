import { api } from "@/lib/axios";
import type { CompanyBriefView, CompanyFollow } from "@/types";

export const companiesService = {
  briefForJob: (jobId: string) =>
    api
      .get<CompanyBriefView>(`/companies/brief/by-job/${jobId}`)
      .then((r) => r.data),

  follows: () => api.get<CompanyFollow[]>("/companies/follows").then((r) => r.data),

  follow: (jobId: string) =>
    api.post<CompanyFollow>("/companies/follows", { jobId }).then((r) => r.data),

  unfollow: (id: string) =>
    api.delete<{ removed: number }>(`/companies/follows/${id}`).then((r) => r.data),
};
