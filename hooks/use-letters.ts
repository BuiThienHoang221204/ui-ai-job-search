"use client";

import { documentsService, type DocumentKind } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { readLetter } from "@/lib/document-content";
import { keys } from "@/lib/query-keys";

const EMPTY = { text: "", subject: null, empty: true } as const;

const RECENT_LIMIT = 50;

/** Các tài liệu gần nhất của một loại (thư, mail, CV), đủ để gom theo tin trên trang Thư xin việc. */
export function useRecentDocuments(kind: DocumentKind) {
  return useApiQuery(
    keys.recentDocuments(kind),
    () => documentsService.list(kind, undefined, { limit: RECENT_LIMIT }),
    { errorMessage: "Không tải được danh sách tài liệu" },
  );
}

/** CV mới nhất đã viết cho từng tin, tra theo `jobId`. */
export function useCvByJob() {
  const { data } = useRecentDocuments("CV");
  const byJob = new Map<string, { id: string; title: string }>();
  for (const cv of data?.items ?? []) {
    if (cv.jobId && cv.status === "DONE" && !byJob.has(cv.jobId)) {
      byJob.set(cv.jobId, { id: cv.id, title: cv.title });
    }
  }
  return byJob;
}

/** Một thư hoặc mail đã viết, kèm văn bản thuần (để sao chép, đếm chữ) và tiêu đề mail. */
export function useLetterDocument(documentId: string) {
  const query = useApiQuery(
    keys.document(documentId),
    () => documentsService.get(documentId),
    { errorMessage: "Không mở được thư này" },
  );
  const record = query.data ?? null;
  return { ...query, record, ...(record ? readLetter(record) : EMPTY) };
}

/** CV mới nhất đã viết xong cho đúng một tin; chỉ tải một bản ghi thay vì cả danh sách CV. */
export function useJobCv(jobId: string | null) {
  const { data } = useApiQuery(
    keys.jobCv(jobId ?? ""),
    () => documentsService.list("CV", jobId ?? undefined, { limit: 1 }),
    { errorMessage: "Không tải được CV của tin này", enabled: Boolean(jobId) },
  );
  const cv = data?.items[0];
  return cv?.status === "DONE" ? { id: cv.id, title: cv.title } : undefined;
}
