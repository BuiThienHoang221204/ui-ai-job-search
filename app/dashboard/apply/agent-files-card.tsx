"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  Check,
  Copy,
  Eye,
  FileCode,
  FileText,
} from "@phosphor-icons/react/ssr";
import { agentService, type AgentArtifact } from "@/services";
import { useCopy } from "@/hooks/use-copy";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";

const kb = (bytes: number): string =>
  `${Math.max(1, Math.round(bytes / 1024))} KB`;

const editorHref = (kind: string | undefined, jobId: string | null): string =>
  kind === "COVER_LETTER"
    ? "/dashboard/cover-letter"
    : `/dashboard/cv-optimizer${jobId ? `?jobId=${jobId}` : ""}`;

export function AgentFilesCard({
  runId,
  jobId,
  artifacts,
  running,
}: {
  runId: string;
  jobId: string | null;
  artifacts: AgentArtifact[];
  running: boolean;
}) {
  const router = useRouter();
  const { copied, copy } = useCopy();
  const [open, setOpen] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (artifacts.length === 0) return null;

  const show = async (name: string) => {
    setOpen(name);
    setContent(null);
    setError(null);
    try {
      const file = await agentService.artifact(runId, name);
      setContent(file.content);
    } catch (cause: unknown) {
      if (apiErrorStatus(cause) === 401) {
        router.replace("/login?next=/dashboard/apply");
        return;
      }
      setError(apiErrorMessage(cause, "Không đọc được file"));
    }
  };

  return (
    <SectionCard
      compact
      icon={FileCode}
      iconClassName="size-4 text-emerald-600"
      title="Hồ sơ đã soạn"
      description={
        running
          ? `${artifacts.length} file — agent vẫn đang chạy tiếp`
          : `${artifacts.length} file`
      }
      className="border-slate-200/90"
    >
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {artifacts.map((file) => (
          <li
            key={file.key}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs"
          >
            {file.documentId ? (
              <FileText className="size-4.5 shrink-0 text-emerald-600" />
            ) : (
              <FileCode className="size-4.5 shrink-0 text-slate-400" />
            )}

            <span className="min-w-0 flex-1 truncate text-slate-700">
              {file.documentId
                ? file.kind === "COVER_LETTER"
                  ? "Thư xin việc"
                  : "CV đã may đo"
                : file.name}
            </span>

            {file.documentId ? (
              <Link href={editorHref(file.kind, jobId)}>
                <Button variant="outline" size="sm">
                  <ArrowSquareOut className="size-4" />
                  Mở để sửa
                </Button>
              </Link>
            ) : (
              <>
                <span className="shrink-0 text-slate-400">{kb(file.bytes)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void show(file.name)}
                >
                  <Eye className="size-4" />
                  Xem
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ?? "File"}
        className="max-w-3xl"
      >
        {error ? (
          <Alert tone="danger">{error}</Alert>
        ) : content === null ? (
          <Skeleton className="h-64 animate-pulse" />
        ) : (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy("file", content)}
            >
              {copied === "file" ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied === "file" ? "Đã sao chép" : "Sao chép"}
            </Button>
            <pre className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-2xs leading-relaxed whitespace-pre-wrap text-slate-700">
              {content}
            </pre>
          </div>
        )}
      </Modal>
    </SectionCard>
  );
}
