"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Code, FileArrowDown } from "@phosphor-icons/react/ssr";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useAsyncData } from "@/hooks/use-async-data";
import { documentsService } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { openBlobInNewTab } from "@/utils";

/** Khối mã `.tex` thô và nút mở PDF, chỉ tải khi người dùng bấm mở (người gọi phải truyền `key`). */
export function DocumentSource({
  documentId,
  loginNext,
}: {
  documentId: string;
  loginNext: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = useMemo(
    () => (open ? () => documentsService.source(documentId) : null),
    [open, documentId],
  );

  const tex = useAsyncData(load, {
    loginNext,
    errorMessage: "Không đọc được mã .tex",
  });

  const source = tex.data;
  const error = pdfError ?? tex.error;

  /** Tải PDF qua axios (đúng đường xác thực) rồi mở trong tab mới. */
  const openPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      openBlobInNewTab(await documentsService.pdf(documentId));
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(`/login?next=${loginNext}`);
        return;
      }
      setPdfError(apiErrorMessage(err, "Không tạo được PDF"));
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={pdfLoading} onClick={() => void openPdf()}>
          <FileArrowDown className="size-4" />
          {pdfLoading ? "Đang tạo PDF…" : "Xem PDF"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((current) => !current)}
        >
          <Code className="size-4" />
          {open ? "Ẩn mã .tex" : "Xem mã .tex"}
        </Button>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {open && !error && source === null && (
        <div className="animate-pulse">
          <Skeleton className="h-40" />
        </div>
      )}

      {open && source !== null && (
        <pre className="max-h-96 overflow-auto rounded-xl border-slab-2 bg-slab text-slab-muted border p-4 font-mono text-2xs leading-relaxed">
          {source}
        </pre>
      )}
    </div>
  );
}
