import { api } from "@/lib/axios";
import type { Paginated } from "./types";
import type { AiFailureKind } from "@/lib/failure-message";

export type MockInterviewStatus =
  | "PENDING"
  | "RUNNING"
  | "WAITING_USER"
  | "DONE"
  | "FAILED";

export interface InterviewStep {
  id: string;
  index: number;
  text: string;
  toolCalls: Array<{ tool: string; input: unknown }>;
  toolResults: Array<{ tool: string; output: unknown }>;
  durationMs: number;
  createdAt: string;
}

export interface MockInterviewRecord {
  id: string;
  workflow: string;
  status: MockInterviewStatus;
  jobId: string | null;
  result: { text?: string } | null;
  question: string | null;
  answer: string | null;
  modelId: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  finishedAt: string | null;
  steps: InterviewStep[];
}

export interface MockInterviewSummary {
  id: string;
  workflow: string;
  status: MockInterviewStatus;
  question: string | null;
  modelId: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  finishedAt: string | null;
  jobId: string | null;
  job: { title: string; company: string } | null;
  _count: { steps: number };
}

export type MockInterviewListQuery = {
  limit?: number;
  offset?: number;
  jobId?: string;
  workflow?: string;
};

export const mockInterviewService = {
  get: (id: string) =>
    api.get<MockInterviewRecord>(`/mock-interviews/${id}`).then((r) => r.data),

  list: (query?: MockInterviewListQuery) =>
    api
      .get<Paginated<MockInterviewSummary>>("/mock-interviews", { params: query })
      .then((r) => r.data),
};
