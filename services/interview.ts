import { api } from "@/lib/axios";
import type {
  AnswerKind,
  AnswerResult,
  InterviewPrepRecord,
  InterviewPrepSummary,
  Paginated,
  QueuedResult,
} from "@/types";

const answerPath = (jobId: string, kind: AnswerKind, index: number) =>
  `/interview/${jobId}/answers/${kind.toLowerCase()}/${index}`;

export const interviewService = {
  list: (page?: { limit?: number; offset?: number }) =>
    api
      .get<Paginated<InterviewPrepSummary>>("/interview", { params: page })
      .then((r) => r.data),

  get: (jobId: string) =>
    api.get<InterviewPrepRecord>(`/interview/${jobId}`).then((r) => r.data),

  prep: (jobId: string, force = false) =>
    api
      .post<QueuedResult>("/interview/prep", { jobId, force })
      .then((r) => r.data),

  /** Lưu câu tự trả lời; chuỗi rỗng là xoá. */
  saveAnswer: (jobId: string, kind: AnswerKind, index: number, text: string) =>
    api
      .put<AnswerResult>(answerPath(jobId, kind, index), { text })
      .then((r) => r.data),

  /** Lưu câu trả lời rồi nhờ AI nhận xét; tốn một lượt gọi model. */
  feedback: (jobId: string, kind: AnswerKind, index: number, text: string) =>
    api
      .post<AnswerResult>(`${answerPath(jobId, kind, index)}/feedback`, {
        text,
      })
      .then((r) => r.data),
};
