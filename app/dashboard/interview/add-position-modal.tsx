"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react/ssr";
import { applicationsService, interviewService, jobsService } from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { useInterviewRefresh, useSelectedJob } from "@/hooks/use-interview-prep";
import { cn, companyColor, companyInitials } from "@/utils";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";

type Source = "applied" | "saved";

const SAVED_LIMIT = 50;

interface Option {
  jobId: string;
  title: string;
  company: string;
  companyLogo?: string | null;
}

const EMPTY: Record<Source, { text: string; href: string; link: string }> = {
  applied: {
    text: "Chưa có đơn nào ở trạng thái Đã nộp.",
    href: "/dashboard/applications",
    link: "Mở Lịch sử ứng tuyển",
  },
  saved: {
    text: "Bạn chưa lưu tin nào.",
    href: "/dashboard/jobs",
    link: "Tìm việc làm",
  },
};

/** Chọn một tin (đơn đã nộp hoặc tin đã lưu) rồi xếp hàng soạn bộ câu hỏi cho nó. */
export function AddPositionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [, select] = useSelectedJob();
  const refresh = useInterviewRefresh();
  const [source, setSource] = useState<Source>("applied");
  const [jobId, setJobId] = useState<string | null>(null);
  const [queueing, setQueueing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applied = useApiQuery(
    ["applications", "jobs", "APPLIED"],
    () => applicationsService.jobs("APPLIED"),
    { errorMessage: "Không tải được danh sách đơn đã nộp", enabled: open },
  );
  const saved = useApiQuery(
    ["jobs", "list", { saved: true, limit: SAVED_LIMIT }],
    () => jobsService.list({ saved: true, limit: SAVED_LIMIT }),
    { errorMessage: "Không tải được tin đã lưu", enabled: open },
  );

  const current = source === "applied" ? applied : saved;
  const options: Option[] | null =
    source === "applied"
      ? applied.data
      : (saved.data?.items.map((job) => ({
          jobId: job.id,
          title: job.title,
          company: job.company,
          companyLogo: job.companyLogo,
        })) ?? null);

  const launch = async () => {
    if (!jobId) return;
    setQueueing(true);
    setError(null);
    try {
      await interviewService.prep(jobId);
      select(jobId);
      refresh();
      setJobId(null);
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause, "Không xếp được vào hàng đợi"));
    } finally {
      setQueueing(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm vị trí để chuẩn bị"
      className="max-w-lg"
    >
      <Tabs
        tabs={[
          {
            value: "applied",
            label: `Đơn đã nộp${applied.data ? ` (${applied.data.length})` : ""}`,
          },
          {
            value: "saved",
            label: `Tin đã lưu${saved.data ? ` (${saved.data.items.length})` : ""}`,
          },
        ]}
        value={source}
        onChange={(value) => {
          setSource(value as Source);
          setJobId(null);
        }}
      />

      <div className="mt-3 max-h-80 min-h-40 overflow-y-auto">
        {current.error ? (
          <p className="py-6 text-center text-sm text-rose-600">{current.error}</p>
        ) : !options ? (
          <div className="space-y-2 py-1">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : options.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {EMPTY[source].text}{" "}
            <Link href={EMPTY[source].href} className="text-primary-700 hover:underline">
              {EMPTY[source].link}
            </Link>
          </p>
        ) : (
          <ul className="space-y-1" role="listbox" aria-label="Chọn tin">
            {options.map((option) => {
              const active = option.jobId === jobId;
              return (
                <li key={option.jobId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setJobId(option.jobId)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary-300 bg-primary-50"
                        : "border-transparent hover:bg-slate-50",
                    )}
                  >
                    <CompanyLogo
                      initials={companyInitials(option.company)}
                      color={companyColor(option.company)}
                      src={option.companyLogo}
                      size="sm"
                      className="size-9 text-xs"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {option.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {option.company}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Soạn mất khoảng một phút; bạn có thể rời trang.
        </p>
        <Button onClick={() => void launch()} loading={queueing} disabled={!jobId}>
          {!queueing && <Sparkle className="size-4.5" />}
          Soạn bộ câu hỏi
        </Button>
      </div>
    </Modal>
  );
}
