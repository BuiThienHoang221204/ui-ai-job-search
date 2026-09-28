import type { PartialCv } from "@/lib/cv-partial";
import { type DocumentRecord, type QueuedDocument } from "@/services";


export type DocumentJobPhase =
  | "idle"
  | "generating"
  | "done"
  | "failed"
  | "timeout";

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

/** Ghép bản ghi vừa đọc được vào danh sách lịch sử, cập nhật tại chỗ nếu đã có. */
export function upsertDocument(
  documents: DocumentRecord[],
  record: DocumentRecord,
): DocumentRecord[] {
  const index = documents.findIndex((item) => item.id === record.id);
  if (index === -1) return [record, ...documents];
  const next = [...documents];
  next[index] = record;
  return next;
}
