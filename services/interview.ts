import type { AiFailureKind } from "@/lib/failure-message";
import { api } from "@/lib/axios";
import type { Paginated, QueuedResult, WorkStatus } from "./types";

export type AnswerKind = "STAR" | "TOUGH";

export interface AnswerFeedback {
  summary: string;
  improvements: string[];
}

export interface SavedAnswer {
  text: string;
  feedback: AnswerFeedback | null;
  feedbackStale: boolean;
  updatedAt: string;
}

export interface PrepAnswer extends SavedAnswer {
  kind: AnswerKind;
  index: number;
}

export interface PrepApplication {
  id: string;
  jobId: string;
  status: string;
  interviewAt: string | null;
}

export interface InterviewPrepRecord {
  id: string;
  jobId: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
  };
  status: WorkStatus;
  starAnswers: unknown;
  toughQuestions: unknown;
  questionsToAsk: string[];
  talkingPoints: string[];
  likelyProbes: string[];
  modelId: string | null;
  generatedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  updatedAt: string;
  practiced: number;
  total: number;
  answers: PrepAnswer[];
  application: PrepApplication | null;
}

export type InterviewPrepSummary = Pick<
  InterviewPrepRecord,
  | "id"
  | "jobId"
  | "job"
  | "status"
  | "generatedAt"
  | "failureKind"
  | "updatedAt"
  | "practiced"
  | "total"
  | "application"
>;

export interface AnswerResult {
  kind: AnswerKind;
  index: number;
  answer: SavedAnswer | null;
}

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
