import { api } from "@/lib/axios";
import type {
  JobFilters,
  JobListItem,
  JobListParams,
  JobRecord,
  Paginated,
  PublicJob,
  PublicJobDetail,
  PublicJobListParams,
} from "@/types";

export const jobsService = {
  list: (params?: JobListParams) =>
    api
      .get<Paginated<JobListItem> & { needsOccupation?: boolean }>("/jobs", { params })
      .then((r) => r.data),
  filters: () => api.get<JobFilters>("/jobs/filters").then((r) => r.data),

  get: (id: string) => api.get<JobRecord>(`/jobs/${id}`).then((r) => r.data),

  publicList: (params: PublicJobListParams) =>
    api
      .get<Paginated<PublicJob>>("/public/jobs", { params })
      .then((r) => r.data),

  publicGet: (id: string) =>
    api.get<PublicJobDetail>(`/public/jobs/${id}`).then((r) => r.data),

  save: (id: string) =>
    api.post<{ saved: true }>(`/jobs/${id}/save`).then((r) => r.data),

  unsave: (id: string) =>
    api.delete<{ saved: false }>(`/jobs/${id}/save`).then((r) => r.data),
};
