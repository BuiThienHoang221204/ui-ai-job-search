"use client";

import { LetterLiveProgress, type PartialLetter } from "./letter-live-progress";
import { useMemo, useState } from "react";
import { Sparkle } from "@phosphor-icons/react/ssr";
import type { JobMatchWithJob } from "@/types";
import { documentsService, type DocumentRecord } from "@/services";
import {
  DocumentHistory,
  DocumentJobStatus,
  JobSelectCard,
  upsertDocument,
  useDocumentJob,
} from "@/components/dashboard/document-job";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { CoverLetterResult } from "./cover-letter-result";

const DOCUMENT_PAGE_SIZE = 10;

/** Panel thư xin việc gắn với một tin đã có, kết quả có bản `.tex` và PDF. */
export function CoverLetterPanel({
  matches,
  fixedJobId,
  loginNext,
}: {
  matches: JobMatchWithJob[];
  fixedJobId: string | null;
  loginNext: string;
}) {
  const [jobId, setJobId] = useState<string>(fixedJobId ?? "");
  const job = useDocumentJob(loginNext);
  const [documentOffset, setDocumentOffset] = useState(0);

  const page = useApiQuery(
    keys.documentList("COVER_LETTER", fixedJobId, documentOffset),
    () =>
      documentsService.list("COVER_LETTER", fixedJobId ?? undefined, {
        limit: DOCUMENT_PAGE_SIZE,
        offset: documentOffset,
      }),
    { errorMessage: "Không tải được kho thư xin việc", keepPrevious: true },
  );

  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = page.data?.items ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [page.data, job.document]);

  const handleGenerate = () => {
    if (!jobId) return;
    job.startStream(() =>
      documentsService.createCoverLetter(jobId, true),
    );
  };

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  if (!documents) return <CoverLetterSkeleton />;

  const record = job.document;
  const isGenerating = job.phase === "generating";
  const selected = matches.find((match) => match.jobId === jobId) ?? null;

  return (
    <div className="space-y-6">
      <JobSelectCard
        title="Chọn tin tuyển dụng"
        description="Thư xin việc luôn viết cho một vị trí cụ thể, nên bước này là bắt buộc"
        selectId="letter-job"
        matches={matches}
        value={jobId}
        onChange={setJobId}
        disabled={isGenerating || Boolean(fixedJobId)}
        emptyOptionLabel="— Chọn một công việc —"
        hint={
          matches.length === 0
            ? "Chưa có công việc nào được chấm điểm. Hãy quét tin tuyển dụng trước."
            : undefined
        }
        action={
          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={!jobId}
          >
            <Sparkle className="size-4.5" />
            {isGenerating ? "Đang tạo…" : "Tạo thư xin việc"}
          </Button>
        }
      />

      {selected && !isGenerating && job.phase !== "done" && (
        <p className="text-xs text-slate-500">
          Thư sẽ được viết cho vị trí{" "}
          <span className="font-semibold text-slate-700">
            {selected.job.title}
          </span>{" "}
          tại{" "}
          <span className="font-semibold text-slate-700">
            {selected.job.company}
          </span>
          .
        </p>
      )}

      <DocumentJobStatus job={job} onRegenerate={handleGenerate} />

      {isGenerating && (
        <LetterLiveProgress partial={job.partial as PartialLetter | null} />
      )}

      {job.phase === "done" && record && (
        <CoverLetterResult record={record} loginNext={loginNext} />
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
        emptyLabel="Bạn chưa tạo thư xin việc nào. Chọn một công việc rồi bấm “Tạo thư xin việc”."
      />
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function CoverLetterSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-36" />
      <Skeleton className="h-64" />
    </SkeletonPage>
  );
}
