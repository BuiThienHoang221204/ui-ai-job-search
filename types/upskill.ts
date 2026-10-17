import type { AiFailureKind } from "./ai";
import type { WorkStatus } from "./api";

export interface UpskillPartial {
  step?: number;
  value?: unknown;
}

export interface UpskillReportRecord {
  id: string;
  mode: "AGGREGATE" | "TARGETED";
  jobId: string | null;
  status: WorkStatus;
  jobsAnalysed: number;
  hardGaps: unknown;
  synthesisedGaps: unknown;
  learningPlan: unknown;
  summary: string | null;
  modelId: string | null;
  generatedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
}

export type UpskillInFlight = Pick<UpskillReportRecord, "id" | "createdAt" | "jobsAnalysed">;
