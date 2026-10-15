"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { CvPreview } from "../cv-preview";
import { useCvPreview } from "@/hooks/use-cv-draft";

const ZOOMS = [
  { fullSize: false, label: "Vừa khung" },
  { fullSize: true, label: "100%" },
];

/** Trang CV ở giữa, gõ sửa thẳng lên trang; trên điện thoại chỉ xem. */
export function PreviewStage({ documentId }: { documentId: string }) {
  const { data: html, error } = useCvPreview(documentId);
  const [fullSize, setFullSize] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3 px-1 text-xs text-slate-500">
        <div className="hidden rounded-lg border border-slate-200 bg-white p-0.5 md:flex">
          {ZOOMS.map((zoom) => (
            <button
              key={zoom.label}
              type="button"
              onClick={() => setFullSize(zoom.fullSize)}
              className={
                "cursor-pointer rounded-md px-2.5 py-1 font-semibold " +
                (fullSize === zoom.fullSize
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-500 hover:text-slate-800")
              }
            >
              {zoom.label}
            </button>
          ))}
        </div>
        <span className="hidden md:inline">
          Bấm vào chữ trên CV để sửa · Enter thêm dòng · Backspace ở dòng trống
          để xoá
        </span>
        <span className="md:hidden">
          Mở trên máy tính để sửa trực tiếp trên CV
        </span>
      </div>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className="mx-auto max-w-3xl">
        <CvPreview html={html} fullSize={fullSize} />
      </div>
    </div>
  );
}
