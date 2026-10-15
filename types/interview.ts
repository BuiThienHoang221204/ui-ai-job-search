import type { AiFailureKind } from "./ai";
import type { WorkStatus } from "./api";

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
> & { mockCount: number };

export interface AnswerResult {
  kind: AnswerKind;
  index: number;
  answer: SavedAnswer | null;
}
