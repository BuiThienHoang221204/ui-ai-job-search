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

/** Đủ để chọn trong một danh sách thả xuống mà không kéo cả bảng matches về. */
const MATCH_LIMIT = 50;

/** Số tài liệu hiện một lúc trong kho; phần còn lại lật bằng phân trang. */
const DOCUMENT_PAGE_SIZE = 10;

export function CvOptimizerView() {
  const fixedJobId = useSearchParams().get("jobId");
  const [language, setLanguage] = useState<CvLanguage>("vi");

  /*
   * Nguồn của lượt sinh GẦN NHẤT, không phải nguồn đang chọn trong thẻ.
   *
   * `DocumentJobStatus` có nút "Thử lại", và nút đó phải sinh lại đúng thứ vừa
   * hỏng. Đọc lại state của thẻ nguồn thì người dùng đổi tab trong lúc chờ là
   * bấm Thử lại ra một CV khác hẳn.
   */
  const [source, setSource] = useState<CvSourceInput>(
    fixedJobId ? { jobId: fixedJobId } : {},
  );

  const job = useDocumentJob(LOGIN_NEXT);

  const [documentOffset, setDocumentOffset] = useState(0);

  /*
   * Hai truy vấn RIÊNG, không gộp một lần tải như trước.
   *
   * Danh sách vị trí ở đây giống hệt danh sách màn "Thư đã viết" - cùng khoá thì
   * màn nào mở sau lấy miễn phí. Đo trên một phiên duyệt: gộp chung thì endpoint
   * này bị gọi 4 lần, tách ra và dùng chung khoá thì còn 1.
   *
   * Tách ra còn cho phép xoá riêng kho tài liệu sau khi sinh CV, mà không kéo
   * theo một lượt tải lại danh sách vị trí vốn không đổi.
   */
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

  // Suy ra lúc render, không chép vào state bằng effect — xem giải thích ở
  // `cover-letter-view.tsx`, hai màn dùng cùng một cách.
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

      {/* `key` là BẮT BUỘC: nó buộc React dựng lại component khi đổi tài
          liệu, thay cho một effect tự dọn state bên trong. */}
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
