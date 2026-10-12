import type { DocumentRecord } from "@/services";

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
