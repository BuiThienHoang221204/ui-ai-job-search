import type { AiFailureKind } from "./api";

export type MockInterviewStatus =
  "PENDING" | "RUNNING" | "WAITING_USER" | "DONE" | "FAILED";

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
  input: { mode?: string } | null;
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
  closing: string | null;
}

export type MockInterviewListQuery = {
  limit?: number;
  offset?: number;
  jobId?: string;
  workflow?: string;
};

export type MicFailure = "blocked" | "missing" | "busy" | "other";

export interface VoiceTurnDraft {
  question: string;
  answer: string;
}

export interface VoiceSession {
  runId: string;
  token: string;
  model: string;
  expiresAt: string;
}
