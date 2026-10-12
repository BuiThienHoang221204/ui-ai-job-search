"use client";

import Link from "next/link";
import { Check, Warning } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";
import { useJobCv, useLetterDocument } from "@/hooks/use-letters";
import { letterChecklist } from "@/lib/letter-checklist";
import type { LetterKind } from "@/types";
import { cn } from "@/utils";

/** Cột phải "Trước khi gửi": thanh độ dài và các mục soát bằng code, không gọi AI. */
export function LetterChecklistCard({ documentId }: { documentId: string }) {
  const { record, text, subject } = useLetterDocument(documentId);
  const cv = useJobCv(record?.jobId ?? null);
  if (!record) return null;

  const { words, range, checks } = letterChecklist({
    kind: record.kind as LetterKind,
    text,
    subject,
    company: record.job?.company ?? null,
    title: record.job?.title ?? null,
    hasJobCv: Boolean(cv),
  });
  const todo = checks.filter((check) => !check.ok).length;
  const max = range[1] * 1.4;
  const cvHref = cv
    ? `/dashboard/cv-optimizer?doc=${cv.id}`
    : record.jobId
      ? `/dashboard/cv-optimizer?jobId=${record.jobId}`
      : null;

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        Trước khi gửi
        {todo > 0 && (
          <span className="rounded-full bg-amber-50 px-2 text-xs font-semibold text-amber-700">
            {todo}
          </span>
        )}
      </h2>

      <p className="mt-4 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
        Độ dài
      </p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-slate-900 tabular-nums">
          {words}
        </span>
        <span className="text-xs text-slate-500">
          chữ · nên {range[0]}–{range[1]}
        </span>
      </p>
      <div className="relative mt-2 h-2 rounded-full bg-slate-100">
        <span
          className="absolute inset-y-0 rounded-full bg-emerald-100"
          style={{
            left: `${(range[0] / max) * 100}%`,
            right: `${100 - (range[1] / max) * 100}%`,
          }}
        />
        <span
          className="absolute -top-1 h-4 w-1 rounded-sm bg-primary-600"
          style={{ left: `${Math.min(words / max, 1) * 100}%` }}
        />
      </div>

      <p className="mt-5 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
        Kiểm tra
      </p>
      <ul>
        {checks.map((check) => (
          <li
            key={check.id}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5 border-t border-slate-100 py-2.5 first:border-t-0"
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                check.ok
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600",
              )}
            >
              {check.ok ? (
                <Check weight="bold" className="size-3.5" />
              ) : (
                <Warning weight="bold" className="size-3.5" />
              )}
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-slate-900">
                {check.title}
              </span>
              <span className="block text-xs leading-relaxed text-slate-500">
                {check.detail}
              </span>
              {check.id === "cv" && cvHref && (
                <Link
                  href={cvHref}
                  className="mt-1 inline-block text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  {cv ? "Mở CV của tin này" : "Tạo CV cho tin này"}
                </Link>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Nội dung do AI viết từ hồ sơ của bạn. Đọc lại một lượt: AI có thể làm
        tròn hay phóng đại thành tích.
      </p>
    </Card>
  );
}
