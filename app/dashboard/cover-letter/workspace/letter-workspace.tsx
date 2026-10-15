"use client";

import { parseCoverLetterContent } from "@/lib/document-content";
import { useLetterDocument } from "@/hooks/use-letters";
import { UNREADABLE_CONTENT_MESSAGE } from "@/components/documents";
import { JobActionCards } from "@/components/jobs/job-action-cards";
import { Alert, PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { EmailPreview } from "./email-preview";
import { LetterChecklistCard } from "./letter-checklist-card";
import { LetterHeader } from "./letter-header";
import { LetterPaper } from "./letter-paper";

/** Khu làm việc của một thư/mail: bản xem ở giữa, danh sách "Trước khi gửi" bên phải. */
export function LetterWorkspace({ documentId }: { documentId: string }) {
  const { record, error, empty } = useLetterDocument(documentId);

  if (error) return <PageError title="Không mở được thư" message={error} />;
  if (!record) {
    return (
      <SkeletonPage>
        <Skeleton className="h-28" />
        <Skeleton className="h-[520px]" />
      </SkeletonPage>
    );
  }

  return (
    <div className="space-y-6">
      <LetterHeader documentId={documentId} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 sm:p-5">
          {empty ? (
            <Alert tone="warning">{UNREADABLE_CONTENT_MESSAGE}</Alert>
          ) : record.kind === "APPLICATION_EMAIL" ? (
            <EmailPreview documentId={documentId} />
          ) : (
            <div className="mx-auto max-w-3xl rounded bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-10">
              <LetterPaper letter={parseCoverLetterContent(record.content)} />
            </div>
          )}
        </div>
        <LetterChecklistCard documentId={documentId} />
      </div>
      {record.jobId && (
        <JobActionCards
          jobId={record.jobId}
          actions={["cv", "interview", "apply"]}
        />
      )}
    </div>
  );
}
