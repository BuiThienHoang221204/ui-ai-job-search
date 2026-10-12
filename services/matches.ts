import type { JobMatchWithJob } from "@/types";
import type { JobMatchDetail } from "./jobs";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult } from "./types";

export type EvaluateResult =
  | (QueuedResult & { alreadyScored: false })
  | {
      queued: false;
      alreadyScored: true;
      overallScore: number | null;
      verdict: JobMatchWithJob["verdict"];
    };

export type MatchSort = "newest" | "score_desc" | "score_asc";

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
