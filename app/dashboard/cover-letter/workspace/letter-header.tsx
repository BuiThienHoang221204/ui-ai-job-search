"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Copy,
  DownloadSimple,
  PaperPlaneTilt,
} from "@phosphor-icons/react/ssr";
import { documentsService } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopy } from "@/hooks/use-copy";
import { useLetterDocument } from "@/hooks/use-letters";
import { apiErrorMessage } from "@/lib/axios";
import { gmailComposeUrl } from "@/lib/mail-link";
import { openBlobInNewTab, relativeTime } from "@/utils";

/** Đầu khu làm việc của một thư: loại thư, tin nhắm tới, sao chép và gửi (Gmail) hoặc tải PDF. */
export function LetterHeader({ documentId }: { documentId: string }) {
  const { record, text, subject, empty } = useLetterDocument(documentId);
  const { copied, copy } = useCopy();
  const [error, setError] = useState<string | null>(null);
  if (!record) return null;

  const isEmail = record.kind === "APPLICATION_EMAIL";
  const compose = isEmail ? gmailComposeUrl({ subject, body: text }) : null;

  const download = async () => {
    setError(null);
    try {
      openBlobInNewTab(await documentsService.pdf(documentId));
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Không tạo được PDF"));
    }
  };

  return (
    <Card className="p-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center sm:size-16">
          <Image
            src={
              isEmail
                ? "/icons/application-email.png"
                : "/icons/cover-letter.png"
            }
            alt={isEmail ? "Mail ứng tuyển" : "Thư xin việc"}
            width={64}
            height={64}
            unoptimized
            className="size-14 object-contain sm:size-16"
          />
        </span>
        <div className="min-w-60 flex-1">
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link
              href="/dashboard/cover-letter"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Thư của bạn
            </Link>
            <span>/</span>
            {record.job?.company ?? record.title}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {isEmail ? "Mail ứng tuyển" : "Thư xin việc"}
            {record.job && ` · ${record.job.title}`}
          </h1>
          {record.generatedAt && (
            <p className="text-xs text-slate-500">
              Tạo {relativeTime(record.generatedAt)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => copy("body", text)}
            disabled={empty}
          >
            {copied ? (
              <Check className="size-4.5" />
            ) : (
              <Copy className="size-4.5" />
            )}
            {copied ? "Đã sao chép" : "Sao chép"}
          </Button>
          {isEmail ? (
            compose && (
              <a href={compose} target="_blank" rel="noopener noreferrer">
                <Button>
                  <PaperPlaneTilt className="size-4.5" />
                  Mở trong Gmail
                </Button>
              </a>
            )
          ) : (
            <Button onClick={() => void download()} disabled={empty}>
              <DownloadSimple className="size-4.5" />
              Tải PDF
            </Button>
          )}
        </div>
      </div>
      {error && (
        <Alert tone="danger" className="mt-4">
          {error}
        </Alert>
      )}
    </Card>
  );
}
