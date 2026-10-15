import type { JobMatchDetail } from "@/types";
import { streamModel } from "./model-stream";
import type { PartialEvaluation } from "@/types";

export {
  ModelStreamError as MatchStreamError,
  ModelServerError as MatchServerError,
} from "./model-stream";

export interface StreamMatchOptions {
  jobId: string;
  onPartial: (partial: PartialEvaluation) => void;
  force?: boolean;
  signal?: AbortSignal;
}

/** Chạy đánh giá độ phù hợp của một tin theo luồng, báo từng phần kết quả. */
export function streamMatchEvaluation({
  jobId,
  onPartial,
  force,
  signal,
}: StreamMatchOptions): Promise<JobMatchDetail> {
  return streamModel<JobMatchDetail, PartialEvaluation>({
    path: `/matches/evaluate-stream/${jobId}`,
    onPartial,
    force,
    signal,
  });
}
