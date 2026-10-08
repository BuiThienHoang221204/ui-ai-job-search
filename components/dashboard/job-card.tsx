"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, MapPin } from "@phosphor-icons/react/ssr";
import { LocationText } from "@/components/dashboard/location-text";
import type { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { JobTime } from "@/components/dashboard/job-time";
import { cn, formatJobSalary, matchToneClasses } from "@/utils";

const MAX_TAGS = 3;

interface JobCardProps {
  job: Job;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}

/** Ô điểm AI ở góc phải thẻ, màu theo mức điểm. */
function AiScore({ score }: { score: number }) {
  const tone = matchToneClasses(score);
  return (
    <div
      title="Điểm phù hợp do AI chấm"
      className={cn(
        "flex min-w-12 shrink-0 flex-col items-center rounded-lg px-2 py-1 leading-tight tabular-nums",
        tone.bg,
        tone.text,
      )}
    >
      <span className="text-base font-bold">{score}</span>
      <span className="text-3xs font-semibold">AI</span>
    </div>
  );
}

/** Lý do phù hợp, gọn 3 dòng, bấm "Xem thêm" để mở tại chỗ. */
function Reason({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
      <p className={cn(!open && "line-clamp-3")}>
        <span className="font-semibold text-emerald-700">Vì sao hợp: </span>
        {text}
      </p>
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        className="mt-1 cursor-pointer text-xs font-semibold text-primary-600 hover:text-primary-700"
      >
        {open ? "Thu gọn" : "Xem thêm"}
      </button>
    </div>
  );
}

/** Thẻ việc làm: logo và tiêu đề ở hàng đầu, phần thân dùng hết bề rộng thẻ. */
export function JobCard({ job, onSavedChange }: JobCardProps) {
  const [pending, setPending] = useState<boolean | null>(null);
  const saved = pending ?? job.saved;

  const toggleSave = () => {
    const next = !saved;
    setPending(next);
    onSavedChange?.(job.id, next);
  };

  if (pending !== null && pending === job.saved) setPending(null);

  const fit = job.systemMatch && job.systemMatch.total > 0 ? job.systemMatch : null;
  const extraTags = job.tags.length - MAX_TAGS;

  return (
    <Card className="flex h-full min-w-0 flex-col gap-3 p-4 transition-all duration-150 hover:border-slate-300 hover:shadow-xs">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <CompanyLogo
          initials={job.companyInitials}
          color={job.companyColor}
          src={job.companyLogo}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-xs text-slate-400" title={job.company}>
            {job.company}
          </p>
          <Link
            href={`/dashboard/jobs/${job.id}`}
            className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight text-slate-900 transition-colors hover:text-primary-600"
          >
            {job.title}
          </Link>
        </div>
        {job.aiMatch !== null && <AiScore score={job.aiMatch} />}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500">
        <span className="font-semibold text-slate-800">{formatJobSalary(job)}</span>
        <span className="inline-flex min-w-0 max-w-full items-center gap-1">
          <MapPin className="size-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            <LocationText location={job.location} />
          </span>
        </span>
        <JobTime time={job.postedAt} />
      </div>

      {fit && (
        <div className="flex items-center gap-2 text-xs text-slate-500" title="Đối chiếu kỹ năng bằng luật, không phải AI">
          Khớp kỹ năng
          <span className="h-1.5 max-w-36 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full bg-teal-600"
              style={{ width: `${Math.round((fit.met / fit.total) * 100)}%` }}
            />
          </span>
          <span className="font-semibold text-teal-700 tabular-nums">
            {fit.met}/{fit.total}
          </span>
        </div>
      )}

      {job.strengths.length > 0 && <Reason text={job.strengths.join(" · ")} />}

      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, MAX_TAGS).map((tag) => (
            <span
              key={tag}
              title={tag}
              className="max-w-44 truncate rounded-full border border-slate-200 px-2.5 py-0.5 text-2xs text-slate-600"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-2xs text-slate-400">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={toggleSave}
          aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
          title={saved ? "Đã lưu" : "Lưu"}
          className="shrink-0 px-2.5"
        >
          <Bookmark className={cn("size-4", saved && "fill-primary-600 text-primary-600")} />
        </Button>
        <Link href={`/dashboard/jobs/${job.id}`} className="min-w-0 flex-1">
          <Button size="sm" variant="primary" className="w-full justify-center">
            Tối ưu & Ứng tuyển
          </Button>
        </Link>
      </div>
    </Card>
  );
}
