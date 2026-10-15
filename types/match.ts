import type { QueuedResult } from "./api";
import type { JobMatchWithJob } from "./job";

export type EvaluateResult =
  | (QueuedResult & { alreadyScored: false })
  | {
      queued: false;
      alreadyScored: true;
      overallScore: number | null;
      verdict: JobMatchWithJob["verdict"];
    };

export type MatchSort = "newest" | "score_desc" | "score_asc";
