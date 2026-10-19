"use client";

import { useEffect } from "react";
import { documentsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { JobActionCards } from "@/components/jobs/job-action-cards";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { CvRail } from "./cv-rail";
import { PreviewStage } from "./preview-stage";
import { WorkspaceHeader } from "./workspace-header";

/** Khu làm việc của một CV: xem trước lớn ở giữa, danh sách hoàn thiện và trình sửa ở cột phải. */
export function CvWorkspace({ documentId }: { documentId: string }) {
  const { data: record, error } = useApiQuery(
    keys.document(documentId),
    () => documentsService.get(documentId),
    { errorMessage: "Không mở được CV này" },
  );
  const load = useCvDraft((state) => state.load);
  const ready = useCvDraft((state) => state.recordId === documentId);

  useEffect(() => {
    if (record) load(record);
  }, [record, load]);

  if (error) return <PageError title="Không mở được CV" message={error} />;
  if (!record || !ready) {
    return (
      <SkeletonPage>
        <Skeleton className="h-32" />
        <Skeleton className="h-[640px]" />
      </SkeletonPage>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader documentId={documentId} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_34rem]">
        <PreviewStage documentId={documentId} />
        <CvRail jobId={record.jobId} />
      </div>
      {record.jobId && (
        <JobActionCards
          jobId={record.jobId}
          actions={["letter", "interview", "apply"]}
        />
      )}
    </div>
  );
}
