"use client";

import { FilePdf, UploadSimple } from "@phosphor-icons/react/ssr";
import { useFileDrop } from "@/hooks/use-file-drop";
import { cn } from "@/lib/cn";

/** Ô kéo thả; chọn hoặc thả file là nộp luôn. */
export function PdfDropZone({ onPick }: { onPick: (file: File) => void }) {
  const { over, dropProps } = useFileDrop(onPick);

  return (
    <label
      {...dropProps}
      className={cn(
        "grid cursor-pointer place-items-center gap-2.5 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        over
          ? "border-primary-500 bg-primary-100"
          : "border-primary-200 bg-primary-50 hover:border-primary-300",
      )}
    >
      <FilePdf weight="duotone" className="size-14 text-rose-500" />
      <p className="text-base font-semibold text-slate-900">
        Kéo thả CV vào đây
      </p>
      <p className="text-sm text-slate-500">hoặc</p>
      <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white">
        <UploadSimple className="size-4.5" />
        Chọn file PDF
      </span>
      <p className="text-xs text-slate-500">PDF, tối đa 10MB</p>
      <input
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
        }}
      />
    </label>
  );
}
