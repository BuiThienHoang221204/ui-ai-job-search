"use client";

import { useState } from "react";
import { LinkSimple, MagicWand, Sparkle } from "@phosphor-icons/react/ssr";
import { apiErrorMessage } from "@/lib/axios";
import { useDraftState } from "@/hooks/use-draft-state";
import type { JobMatchWithJob } from "@/types";
import {
  documentsService,
  type CvLanguage,
  type CvSourceInput,
} from "@/services";
import {
  JobSelect,
  PastedJobFields,
  usePastedJob,
} from "@/components/dashboard/document-job";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/utils";

/** Giá trị của mục "không nhắm vị trí nào" — backend coi jobId là tuỳ chọn. */
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

/**
 * Nguồn tin tuyển dụng cho một CV, và đây là chỗ khác `ApplicationEmailSourceCard`:
 * CV có nguồn thứ ba là KHÔNG CÓ nguồn nào.
 *
 * "CV tổng quát" là một lựa chọn thật chứ không phải trạng thái chưa điền, nên
 * tab "Chọn tin đã có" vẫn bấm được khi ô chọn để trống. Lá mail thì ngược lại:
 * không có đích thì không có gì để viết.
 */
export function CvSourceCard({
  matches,
  fixedJobId,
  language,
  onLanguageChange,
  disabled,
  onSubmit,
}: {
  matches: JobMatchWithJob[];
  /** Vào từ trang chi tiết tin: khoá luôn vào tin đó, không cho đổi. */
  fixedJobId: string | null;
  language: CvLanguage;
  onLanguageChange: (next: CvLanguage) => void;
  disabled: boolean;
  onSubmit: (input: CvSourceInput) => void;
}) {
  const [source, setSource] = useState<Source>("pick");
  const [jobId, setJobId] = useState(fixedJobId ?? NO_JOB);
  const pasted = usePastedJob("cv");

  const [url, setUrl] = useDraftState("cv-url");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const ready = source === "pick" || pasted.ready;

  /**
   * Bóc xong thì đổ vào ba ô của tab dán rồi CHUYỂN sang tab đó.
   *
   * Người dùng phải nhìn thấy thứ vừa bóc trước khi nó đi vào CV: trang tuyển
   * dụng nào cũng có tin gợi ý nằm cạnh, và đọc nhầm tên công ty là lỗi chỉ lộ
   * ra khi CV đã sinh xong.
   */
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
    if (disabled || !ready) return;
    onSubmit(
      source === "pick"
        ? { jobId: jobId === NO_JOB ? undefined : jobId }
        : pasted.value,
    );
  };

  return (
    <SectionCard
      compact
      icon={MagicWand}
      iconClassName="size-4"
      title="Chọn vị trí muốn nhắm tới"
      description="Chọn một tin đã có, hoặc dán mô tả công việc bạn copy được từ bất kỳ đâu. Không chọn gì thì hệ thống sinh CV tổng quát từ hồ sơ của bạn."
      className="border-slate-200/90"
    >
      {!fixedJobId && (
        <Tabs
          tabs={SOURCES}
          value={source}
          onChange={(value) => setSource(value as Source)}
        />
      )}

      {source === "pick" ? (
        <JobSelect
          selectId="cv-job"
          matches={matches}
          value={jobId}
          onChange={setJobId}
          disabled={disabled || Boolean(fixedJobId)}
          emptyOptionLabel="CV tổng quát (không nhắm vị trí nào)"
          hint={
            matches.length === 0
              ? "Chưa có công việc nào được chấm điểm. Dán mô tả công việc ở tab bên cạnh thì không cần chờ."
              : undefined
          }
        />
      ) : source === "paste" ? (
        <PastedJobFields
          idPrefix="cv"
          state={pasted}
          disabled={disabled}
          readyHint="Mô tả này không được lưu thành tin tuyển dụng, chỉ dùng để viết CV."
        />
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="cv-url">Link tin tuyển dụng</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="cv-url"
                className="min-w-64 flex-1"
                value={url}
                disabled={disabled || fetching}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…"
              />
              <Button
                variant="secondary"
                onClick={handleExtract}
                loading={fetching}
                disabled={disabled || url.trim() === ""}
              >
                <LinkSimple className="size-4.5" />
                {fetching ? "Đang đọc…" : "Lấy nội dung"}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Hệ thống tải trang rồi điền sẵn mô tả, tên công ty và vị trí để
              bạn soát lại trước khi tạo CV.
            </p>
          </div>

          {fetchError && <Alert tone="danger">{fetchError}</Alert>}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-end gap-3">
        <div role="group" aria-labelledby="cv-language-label">
          <span
            id="cv-language-label"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Ngôn ngữ CV
          </span>
          <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {LANGUAGES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={disabled}
                aria-pressed={language === value}
                onClick={() => onLanguageChange(value)}
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

        <Button onClick={handleSubmit} loading={disabled} disabled={!ready}>
          <Sparkle className="size-4.5" />
          {disabled ? "Đang tạo…" : "Tạo CV bằng AI"}
        </Button>
      </div>
    </SectionCard>
  );
}
