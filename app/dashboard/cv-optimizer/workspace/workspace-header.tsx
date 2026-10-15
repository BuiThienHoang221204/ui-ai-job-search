"use client";

import Link from "next/link";
import { Check, DownloadSimple, FileText } from "@phosphor-icons/react/ssr";
import { documentsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCvActions, useCvDirty } from "@/hooks/use-cv-draft";
import { CvTemplateStrip } from "./cv-template-strip";
import { relativeTime } from "@/lib/date";

/** Đầu khu làm việc: tên CV, tin nhắm tới, lưu, tải PDF và dải chọn mẫu. */
export function WorkspaceHeader({ documentId }: { documentId: string }) {
  const { data: record } = useApiQuery(
    keys.document(documentId),
    () => documentsService.get(documentId),
    { errorMessage: "Không mở được CV này" },
  );
  const dirty = useCvDirty();
  const { save, download, saving, error } = useCvActions(documentId);
  if (!record) return null;

  return (
    <Card className="divide-y divide-slate-100">
      <div className="flex flex-wrap items-center gap-4 p-5 sm:px-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white">
          <FileText className="size-7" />
        </span>
        <div className="min-w-60 flex-1">
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link
              href="/dashboard/cv-optimizer"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              CV của bạn
            </Link>
            {record.job && (
              <>
                <span>/</span>
                {record.job.company}
              </>
            )}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {record.job?.title ?? record.title}
          </h1>
          <p className="text-xs text-slate-500">
            {record.language === "EN" ? "English" : "Tiếng Việt"}
            {record.generatedAt && ` · tạo ${relativeTime(record.generatedAt)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty ? (
            <Button onClick={() => void save()} loading={saving}>
              <Check className="size-4.5" />
              Lưu thay đổi
            </Button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check className="size-4" />
              Đã lưu
            </span>
          )}
          <Button
            variant={dirty ? "outline" : "primary"}
            onClick={() => void download()}
            disabled={dirty}
            title={dirty ? "Lưu thay đổi trước khi tải PDF" : undefined}
          >
            <DownloadSimple className="size-4.5" />
            Tải PDF
          </Button>
        </div>
      </div>
      {error && (
        <div className="px-5 py-3 sm:px-6">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}
      <CvTemplateStrip />
    </Card>
  );
}
