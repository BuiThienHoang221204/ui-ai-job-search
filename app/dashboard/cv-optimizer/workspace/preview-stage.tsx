"use client";

import { Alert } from "@/components/ui/alert";
import { CvPreview } from "../cv-preview";
import { useCvDraft, useCvPreview } from "@/hooks/use-cv-draft";

/** Bản xem trước lớn ở giữa; bấm vào một mục thì mở đúng mục đó trong trình sửa. */
export function PreviewStage({ documentId }: { documentId: string }) {
  const { data: html, error } = useCvPreview(documentId);
  const tab = useCvDraft((state) => state.tab);
  const openSection = useCvDraft((state) => state.openSection);
  const openEditor = useCvDraft((state) => state.openEditor);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 sm:p-5">
      <p className="mb-3 flex justify-between gap-2 px-1 text-xs text-slate-500">
        <span>Xem trước · khớp đúng file PDF tải về</span>
        <span className="hidden sm:inline">Bấm vào một mục để sửa</span>
      </p>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className="mx-auto max-w-3xl">
        <CvPreview
          html={html}
          activeSection={tab === "noi-dung" ? openSection : null}
          onSectionClick={openEditor}
        />
      </div>
    </div>
  );
}
