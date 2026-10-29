"use client";

import { useState, type ReactNode } from "react";
import { LinkSimple, Sparkle } from "@phosphor-icons/react/ssr";
import { apiErrorMessage } from "@/lib/axios";
import { useDraftState } from "@/hooks/use-draft-state";
import { documentsService } from "@/services";
import { JobSelect, PastedJobFields } from "@/components/documents";
import { usePastedJob } from "@/hooks/use-pasted-job";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import type { CvGenerate, CvLanguage } from "@/types";
import { cn } from "@/lib/cn";

const NO_JOB = "";

type Source = "pick" | "paste" | "url";

const SOURCES = [
  { value: "pick", label: "Chọn tin đã có" },
  { value: "paste", label: "Dán mô tả công việc" },
  { value: "url", label: "Dán link tin tuyển dụng" },
];

const LANGUAGES = [
  ["vi", "Tiếng Việt"],
  ["en", "English"],
] as const;

/** Chọn nguồn tin cho CV: dán JD, tin đã có hoặc CV tổng quát không nhắm tin nào. */
export function CvSourceCard({
  fixedJobId,
  onSubmit,
}: {
  fixedJobId: string | null;
  onSubmit: CvGenerate;
}) {
  const [source, setSource] = useState<Source>("pick");
  const [language, setLanguage] = useState<CvLanguage>("vi");
  const [jobId, setJobId] = useState(fixedJobId ?? NO_JOB);
  const pasted = usePastedJob("cv");

  const [url, setUrl] = useDraftState("cv-url");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const ready = source === "pick" || pasted.ready;

  /** Bóc tin từ URL, đổ vào các ô của tab dán rồi chuyển sang tab đó. */
  const handleExtract = async () => {
    const target = url.trim();
    if (!target || fetching) return;

    setFetching(true);
    setFetchError(null);
    try {
      const job = await documentsService.extractJobFromUrl(target);
      pasted.fill({
        jobDescription: job.description,
        company: job.company,
        title: job.title,
      });
      setSource("paste");
    } catch (error) {
      setFetchError(apiErrorMessage(error, "Không đọc được trang này"));
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = () => {
    if (!ready) return;
    if (source === "pick")
      onSubmit({ jobId: jobId === NO_JOB ? undefined : jobId }, language);
    else onSubmit(pasted.value, language);
  };

  let sourceFields: ReactNode = (
    <div className="space-y-3">
      <div>
        <Label htmlFor="cv-url">Link tin tuyển dụng</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="cv-url"
            className="min-w-64 flex-1"
            value={url}
            disabled={fetching}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
          />
          <Button
            variant="secondary"
            onClick={handleExtract}
            loading={fetching}
            disabled={url.trim() === ""}
          >
            <LinkSimple className="size-4.5" />
            {fetching ? "Đang đọc…" : "Lấy nội dung"}
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Hệ thống tải trang rồi điền sẵn mô tả, tên công ty và vị trí để bạn
          soát lại trước khi tạo CV.
        </p>
      </div>

      {fetchError && <Alert tone="danger">{fetchError}</Alert>}
    </div>
  );
  if (source === "pick")
    sourceFields = (
      <JobSelect
        selectId="cv-job"
        fixedJobId={fixedJobId}
        value={jobId}
        onChange={setJobId}
        disabled={Boolean(fixedJobId)}
        emptyOptionLabel="CV tổng quát (không nhắm vị trí nào)"
        emptyHint="Chưa có công việc nào được chấm điểm. Dán mô tả công việc ở tab bên cạnh thì không cần chờ."
      />
    );
  else if (source === "paste")
    sourceFields = (
      <PastedJobFields
        idPrefix="cv"
        state={pasted}
        disabled={false}
        readyHint="Mô tả này không được lưu thành tin tuyển dụng, chỉ dùng để viết CV."
      />
    );

  return (
    <div className="space-y-4 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">
          Bạn muốn ứng tuyển vị trí nào?
        </p>
        {!fixedJobId && (
          <Tabs
            mobileFull
            tabs={SOURCES}
            value={source}
            onChange={(value) => setSource(value as Source)}
            className="bg-white"
          />
        )}
      </div>

      {sourceFields}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div
          role="group"
          aria-label="Ngôn ngữ CV"
          className="flex items-center justify-between gap-2 sm:justify-start"
        >
          <span className="text-sm text-slate-500">Ngôn ngữ</span>
          <div className="flex h-10.5 items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {LANGUAGES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={language === value}
                onClick={() => setLanguage(value)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  language === value
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={!ready}
        >
          <Sparkle className="size-4.5" />
          Tạo CV bằng AI
        </Button>
      </div>
    </div>
  );
}
