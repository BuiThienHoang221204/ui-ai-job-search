"use client";

import { useCallback, useMemo, useState } from "react";
import {
  documentsService,
  type ApplicationEmailInput,
  type DocumentRecord,
} from "@/services";
import {
  DocumentHistory,
  DocumentJobStatus,
} from "@/components/dashboard/document-job";
import { upsertDocument } from "@/lib/document-list";
import { useDocumentJob } from "@/hooks/use-document-job";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { ApplicationEmailResult } from "./application-email-result";
import { ApplicationEmailSourceCard } from "./application-email-source-card";

const DOCUMENT_PAGE_SIZE = 10;

/** Panel mail ứng tuyển: chọn nguồn tin, chờ AI viết, đọc kết quả và mở lại bản cũ. */
export function ApplicationEmailPanel({
  fixedJobId,
  loginNext,
}: {
  fixedJobId: string | null;
  loginNext: string;
}) {
  const job = useDocumentJob(loginNext);
  const [documentOffset, setDocumentOffset] = useState(0);

  const page = useApiQuery(
    keys.documentList("APPLICATION_EMAIL", fixedJobId, documentOffset),
    () =>
      documentsService.list("APPLICATION_EMAIL", fixedJobId ?? undefined, {
        limit: DOCUMENT_PAGE_SIZE,
        offset: documentOffset,
      }),
    { errorMessage: "Không tải được kho mail ứng tuyển", keepPrevious: true },
  );

  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = page.data?.items ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [page.data, job.document]);

  const [lastInput, setLastInput] = useState<ApplicationEmailInput | null>(
    null,
  );

  const handleGenerate = useCallback(
    (input: ApplicationEmailInput) => {
      setLastInput(input);
      job.start(() => documentsService.createApplicationEmail(input));
    },
    [job],
  );

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  if (!documents) {
    return (
      <SkeletonPage>
        <Skeleton className="h-72" />
        <Skeleton className="h-56" />
      </SkeletonPage>
    );
  }

  const record = job.document;
  const isGenerating = job.phase === "generating";

  return (
    <div className="space-y-6">
      <ApplicationEmailSourceCard
        fixedJobId={fixedJobId}
        disabled={isGenerating}
        onSubmit={handleGenerate}
      />

      <DocumentJobStatus
        job={job}
        onRegenerate={() => lastInput && handleGenerate(lastInput)}
      />

      {job.phase === "done" && record && (
        <ApplicationEmailResult record={record} />
      )}

      <DocumentHistory
        page={{
          offset: documentOffset,
          limit: DOCUMENT_PAGE_SIZE,
          total: page.data?.total ?? 0,
          onOffsetChange: setDocumentOffset,
        }}
        documents={documents}
        activeId={record?.id ?? null}
        onSelect={job.open}
        emptyLabel="Bạn chưa viết mail ứng tuyển nào. Dán mô tả công việc rồi bấm “Viết mail ứng tuyển”."
      />
    </div>
  );
}
