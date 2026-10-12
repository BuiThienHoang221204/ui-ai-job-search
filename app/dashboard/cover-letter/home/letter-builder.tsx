"use client";

import { useState } from "react";
import { Envelope, FileText, Sparkle } from "@phosphor-icons/react/ssr";
import {
  JobSelect,
  PastedJobFields,
} from "@/components/dashboard/document-job";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useCvByJob } from "@/hooks/use-letters";
import { usePastedJob } from "@/hooks/use-pasted-job";
import type { LetterGenerate, LetterKind } from "@/types";
import { cn } from "@/utils";

type Source = "pick" | "paste";

const SOURCES = [
  { value: "pick", label: "Tin đã có" },
  { value: "paste", label: "Dán mô tả công việc" },
];

const KINDS = [
  {
    kind: "APPLICATION_EMAIL",
    title: "Mail ứng tuyển",
    hint: "Gửi thẳng cho nhà tuyển dụng, kèm CV. Ngắn 150–250 chữ, đọc trên điện thoại. Dùng khi tin ghi “gửi CV qua email”.",
    icon: Envelope,
    iconClassName: "bg-cyan-50 text-cyan-700",
  },
  {
    kind: "COVER_LETTER",
    title: "Thư xin việc (PDF)",
    hint: "Một trang trang trọng để đính kèm cùng CV. Dùng khi tin yêu cầu cover letter hoặc nộp qua cổng tuyển dụng.",
    icon: FileText,
    iconClassName: "bg-primary-50 text-primary-600",
  },
] as const;

/** Khung xanh nhạt trong thẻ đầu trang: chọn tin, chọn loại thư rồi bấm viết. */
export function LetterBuilder({
  fixedJobId,
  fixedKind,
  onGenerate,
}: {
  fixedJobId: string | null;
  fixedKind: LetterKind | null;
  onGenerate: LetterGenerate;
}) {
  const [source, setSource] = useState<Source>("pick");
  const [jobId, setJobId] = useState(fixedJobId ?? "");
  const [kind, setKind] = useState<LetterKind>(
    fixedKind ?? (fixedJobId ? "COVER_LETTER" : "APPLICATION_EMAIL"),
  );
  const pasted = usePastedJob("letter");
  const cvByJob = useCvByJob();

  const letterNeedsJob = kind === "COVER_LETTER" && source === "paste";
  const ready = source === "pick" ? Boolean(jobId) : pasted.ready;

  const submit = () => {
    if (!ready || letterNeedsJob) return;
    onGenerate(kind, source === "pick" ? { jobId } : pasted.value);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">
          1. Bạn ứng tuyển tin nào?
        </p>
        {!fixedJobId && (
          <Tabs
            tabs={SOURCES}
            value={source}
            onChange={(value) => setSource(value as Source)}
            className="bg-white"
          />
        )}
      </div>

      {source === "pick" ? (
        <div>
          <JobSelect
            selectId="letter-job"
            fixedJobId={fixedJobId}
            value={jobId}
            onChange={setJobId}
            disabled={Boolean(fixedJobId)}
            emptyOptionLabel="— Chọn một tin —"
            emptyHint="Chưa có tin nào được chấm điểm. Dán mô tả công việc ở tab bên cạnh thì không cần chờ."
          />
          {jobId && (
            <p className="mt-1.5 text-xs text-slate-500">
              {cvByJob.has(jobId) ? (
                <span className="font-medium text-emerald-600">
                  Đã có CV viết cho tin này — thư sẽ đi cùng CV đó.
                </span>
              ) : (
                "Tin này chưa có CV riêng. Nên tối ưu CV cho tin này để nộp kèm."
              )}
            </p>
          )}
        </div>
      ) : (
        <PastedJobFields
          idPrefix="letter"
          state={pasted}
          disabled={false}
          rows={6}
          readyHint="Mô tả này không được lưu thành tin tuyển dụng, chỉ dùng để viết thư."
        />
      )}

      <p className="text-sm font-semibold text-slate-900">
        2. Bạn cần loại nào?
      </p>
      <div className="grid gap-2.5 md:grid-cols-2">
        {KINDS.map((item) => {
          const Icon = item.icon;
          const active = kind === item.kind;
          return (
            <button
              key={item.kind}
              type="button"
              aria-pressed={active}
              onClick={() => setKind(item.kind)}
              className={cn(
                "grid cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_1.125rem] items-start gap-3 rounded-xl border bg-white p-3.5 text-left transition",
                active
                  ? "border-primary-600 ring-3 ring-primary-50"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  item.iconClassName,
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {item.hint}
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 size-4.5 rounded-full border-2",
                  active
                    ? "border-[5px] border-primary-600"
                    : "border-slate-300",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {letterNeedsJob && (
          <p className="mr-auto text-xs text-amber-700">
            Thư xin việc PDF cần một tin đã có trong hệ thống. Chọn “Tin đã có”,
            hoặc viết mail ứng tuyển từ mô tả đã dán.
          </p>
        )}
        <Button size="lg" onClick={submit} disabled={!ready || letterNeedsJob}>
          <Sparkle className="size-4.5" />
          {kind === "COVER_LETTER" ? "Viết thư bằng AI" : "Viết mail bằng AI"}
        </Button>
      </div>
    </div>
  );
}
