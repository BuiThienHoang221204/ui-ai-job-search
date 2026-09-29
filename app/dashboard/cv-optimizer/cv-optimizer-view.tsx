"use client";

import { CvLiveProgress } from "./cv-live-progress";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import {
  documentsService,
  matchesService,
  type CvLanguage,
  type CvSourceInput,
  type DocumentRecord,
} from "@/services";
import { isCvContentEmpty, parseCvContent } from "@/lib/document-content";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  documentSubtitle,
  DocumentHistory,
  DocumentJobStatus,
  DocumentSource,
  DocumentStatusBadge,
  UNREADABLE_CONTENT_MESSAGE,
  upsertDocument,
  useDocumentJob,
} from "@/components/dashboard/document-job";
import { Alert, PageError } from "@/components/ui/alert";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { CvContentView } from "./cv-content";
import { CvSourceCard } from "./cv-source-card";
import { CvStudio } from "./cv-studio";

const LOGIN_NEXT = "/dashboard/cv-optimizer";

const MATCH_LIMIT = 50;

const DOCUMENT_PAGE_SIZE = 10;

/** Màn tối ưu CV: chọn nguồn tin, sinh CV và xem kho tài liệu đã tạo. */
export function CvOptimizerView() {
  const fixedJobId = useSearchParams().get("jobId");
  const [language, setLanguage] = useState<CvLanguage>("vi");

  const [source, setSource] = useState<CvSourceInput>(
    fixedJobId ? { jobId: fixedJobId } : {},
  );

  const job = useDocumentJob(LOGIN_NEXT);

  const [documentOffset, setDocumentOffset] = useState(0);

  const matchPage = useApiQuery(
    keys.matchList(MATCH_LIMIT),
    () => matchesService.list({ limit: MATCH_LIMIT }),
    { errorMessage: "Không tải được danh sách công việc" },
  );

  const documentPage = useApiQuery(
    keys.documentList("CV", fixedJobId, documentOffset),
    () =>
      documentsService.list("CV", fixedJobId ?? undefined, {
        limit: DOCUMENT_PAGE_SIZE,
        offset: documentOffset,
      }),
    { errorMessage: "Không tải được kho CV", keepPrevious: true },
  );

  const error = matchPage.error ?? documentPage.error;
  const matches = matchPage.data?.items ?? null;

  const documents: DocumentRecord[] | null = useMemo(() => {
    const list = documentPage.data?.items ?? null;
    if (!list) return null;
    return job.document ? upsertDocument(list, job.document) : list;
  }, [documentPage.data, job.document]);

  const handleGenerate = (next: CvSourceInput = source) => {
    setSource(next);
    job.startStream(() => documentsService.createCv(next, true, language));
  };

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;

  if (!matches || !documents) return <CvOptimizerSkeleton />;

  const record = job.document;
  const isGenerating = job.phase === "generating";

  return (
    <div className="space-y-6">
      <PageHeader
        title={fixedJobId ? "Tối ưu CV cho tin này" : "CV đã tạo"}
        subtitle={
          fixedJobId
            ? "AI viết lại CV của bạn bám theo đúng tin tuyển dụng bên dưới"
            : "Bấm vào một CV bên dưới để đổi mẫu trình bày và tải PDF"
        }
      />

      <CvSourceCard
        matches={matches}
        fixedJobId={fixedJobId}
        language={language}
        onLanguageChange={setLanguage}
        disabled={isGenerating}
        onSubmit={handleGenerate}
      />

      <DocumentJobStatus job={job} onRegenerate={() => handleGenerate()} />

      {isGenerating && <CvLiveProgress partial={job.partial} />}

      {job.phase === "done" && record && (
        <CvResult record={record} onTemplateSaved={job.recheck} />
      )}

      <DocumentHistory
        page={{
          offset: documentOffset,
          limit: DOCUMENT_PAGE_SIZE,
          total: documentPage.data?.total ?? 0,
          onOffsetChange: setDocumentOffset,
        }}
        documents={documents}
        activeId={record?.id ?? null}
        onSelect={job.open}
        emptyLabel="Bạn chưa tạo CV nào. Bấm “Tạo CV bằng AI” để bắt đầu."
      />
    </div>
  );
}

/** Nội dung CV đã sinh, kèm kho chọn mẫu trình bày. */
function CvResult({
  record,
  onTemplateSaved,
}: {
  record: DocumentRecord;
  onTemplateSaved: () => void;
}) {
  const cv = parseCvContent(record.content);

  return (
    <div className="space-y-4">
      <SectionCard
        compact
        title={record.title}
        description={documentSubtitle(record)}
        className="border-slate-200/90"
        contentClassName="space-y-5"
        actions={<DocumentStatusBadge status={record.status} />}
      >
        {isCvContentEmpty(cv) ? (
          <Alert tone="warning">{UNREADABLE_CONTENT_MESSAGE}</Alert>
        ) : null}
        <CvContentView cv={cv} />
      </SectionCard>

      <CvStudio record={record} onSaved={onTemplateSaved} />

      <DocumentSource
        key={record.id}
        documentId={record.id}
        loginNext={LOGIN_NEXT}
      />
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function CvOptimizerSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-14 w-72" />
      <Skeleton className="h-36" />
      <Skeleton className="h-64" />
    </SkeletonPage>
  );
}
