import type { AuthUser } from "./auth";

export interface AuthResult {
  user: AuthUser;
}

export interface QueuedResult {
  queued: true;
  queueJobId?: string | null;
}

export interface QueuedDocument extends QueuedResult {
  documentId: string;
}

export type WorkStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type AiFailureKind = "SCHEMA" | "TIMEOUT" | "UPSTREAM" | "OTHER";
