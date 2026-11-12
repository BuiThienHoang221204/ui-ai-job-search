import type { AuthUser } from "./auth";

export interface AuthResult {
  user: AuthUser;
}

/** Đăng ký, hoặc đăng nhập tài khoản chưa xác minh: chưa có phiên, cần nhập mã gửi tới `email`. */
export interface VerificationRequired {
  verificationRequired: true;
  email: string;
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

export interface AsyncData<T> {
  data: T | null;
  error: string | null;
  errorStatus: number | null;
  loading: boolean;
  reload: () => void;
}
