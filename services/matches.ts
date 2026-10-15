import { api } from "@/lib/axios";
import type {
  EvaluateResult,
  JobMatchDetail,
  JobMatchWithJob,
  MatchSort,
  Paginated,
} from "@/types";

export const matchesService = {
  list: (params?: { limit?: number; offset?: number; sort?: MatchSort }) =>
    api
      .get<Paginated<JobMatchWithJob>>("/matches", { params })
      .then((r) => r.data),

  get: (jobId: string) =>
    api.get<JobMatchDetail>(`/matches/${jobId}`).then((r) => r.data),

  evaluate: (jobId: string, force = false) =>
    api
      .post<EvaluateResult>("/matches/evaluate", { jobId, force })
      .then((r) => r.data),
};
