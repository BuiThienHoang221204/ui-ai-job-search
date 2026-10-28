"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { useCvUpload } from "@/hooks/use-cv-upload";
import { usePendingCv } from "@/hooks/use-pending-cv";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "./review-card";
import { UploadPanel, UploadTips } from "./upload-cards";

/** Màn đọc CV: tải lên (kèm tiến độ đọc) hoặc xem lại hồ sơ đã điền sẵn, tuỳ trạng thái lượt đọc. */
export function UploadCvView() {
  const cv = useCvUpload();
  const { upload } = cv;

  useEffect(() => {
    const pending = usePendingCv.getState().take();
    if (pending) void upload(pending);
  }, [upload]);

  let note = "AI đọc CV rồi điền sẵn hồ sơ cho bạn xem lại.";
  if (cv.reviewing) note = "Bỏ hoặc sửa chỗ AI đọc sai rồi bấm Lưu.";
  else if (cv.reading)
    note = `Đang đọc ${cv.file?.name ?? cv.draft?.filename ?? "CV"}…`;

  let content: ReactNode = (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18.75rem,1fr)]">
      <UploadPanel
        reading={cv.reading}
        file={cv.file}
        draft={cv.draft}
        partial={cv.partial}
        onPick={(file) => void cv.upload(file)}
        onRetry={() => void cv.retry()}
      />
      <UploadTips />
    </div>
  );
  if (cv.loading) content = <Skeleton className="h-72" />;
  else if (cv.reviewing && cv.draft)
    content = (
      <ReviewCard
        draft={cv.draft}
        profile={cv.profile}
        saving={cv.saving}
        onSave={(values) => void cv.apply(values)}
        onDismiss={cv.dismiss}
      />
    );

  return (
    <div className="mx-auto w-full max-w-340 space-y-5 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cập nhật hồ sơ từ CV
          </h1>
          <p className="mt-1 text-sm text-slate-500">{note}</p>
        </div>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600"
        >
          <ArrowLeft className="size-4" />
          Về hồ sơ
        </Link>
      </header>

      {cv.error && <Alert tone="danger">{cv.error}</Alert>}

      {content}
    </div>
  );
}
