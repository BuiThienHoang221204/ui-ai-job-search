import type { QueuedDocument } from "./api";
import type { DocumentRecord, PartialCv } from "./document";

export type DocumentJobPhase =
  "idle" | "generating" | "done" | "failed" | "timeout";

export interface DocumentJob {
  phase: DocumentJobPhase;
  document: DocumentRecord | null;
  error: string | null;
  partial: PartialCv | null;
  start: (create: () => Promise<QueuedDocument>) => void;
  startStream: (create: () => Promise<QueuedDocument>) => void;
  open: (documentId: string) => void;
  recheck: () => void;
}

export interface PastedJob {
  jobDescription: string;
  company: string;
  title: string;
}

export interface PastedJobState {
  ready: boolean;
  value: PastedJob;
  fill: (next: PastedJob) => void;
  raw: {
    jobDescription: string;
    setJobDescription: (next: string) => void;
    company: string;
    setCompany: (next: string) => void;
    title: string;
    setTitle: (next: string) => void;
  };
}

export interface JobOption {
  jobId: string;
  title: string;
  company: string;
}
