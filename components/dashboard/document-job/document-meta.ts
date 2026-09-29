import type { DocumentRecord } from "@/services";
import { formatDate } from "@/utils";

/** Dòng mô tả dưới tiêu đề tài liệu: sinh lúc nào, bằng model nào. */
export function documentSubtitle(record: DocumentRecord): string {
  const when = record.generatedAt
    ? `Sinh lúc ${formatDate(record.generatedAt)}`
    : "Chưa rõ thời điểm sinh";
  return record.modelId ? `${when} · ${record.modelId}` : when;
}

export const UNREADABLE_CONTENT_MESSAGE =
  "Tài liệu đã chạy xong nhưng nội dung trả về không đọc được. Bạn có thể xem mã .tex bên dưới hoặc tạo lại.";
