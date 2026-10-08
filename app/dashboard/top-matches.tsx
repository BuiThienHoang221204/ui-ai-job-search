"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Target } from "@phosphor-icons/react/ssr";
import type { Job } from "@/types";
import { jobsService } from "@/services";
import { invalidateAfter } from "@/lib/query-keys";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { toJobCard } from "@/lib/adapters";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils";
import { DashSection } from "@/components/dashboard/dash-section";
import { useDashboard } from "./use-dashboard";

/** Nút lưu tin, tự gọi API lưu hoặc bỏ lưu. */
function SaveButton({ jobId, initial }: { jobId: string; initial: boolean }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(initial);

  const toggle = async () => {
    const next = !saved;
    setSaved(next);
    try {
      await (next ? jobsService.save(jobId) : jobsService.unsave(jobId));
      invalidateAfter(queryClient, "saveJob");
    } catch {
      setSaved(!next);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-primary-200 hover:text-primary-600"
    >
      <Bookmark className={cn("size-4", saved && "fill-primary-600 text-primary-600")} />
    </button>
  );
}

/** Một dòng tin: logo, tên tin, dòng phụ, thanh mức phù hợp (khi có điểm), nút lưu và nút hành động. */
export function JobRow({
  job,
  score,
  meta,
  note,
  actionLabel,
}: {
  job: Job;
  score: number | null;
  meta: string;
  note: string | null;
  actionLabel: string;
}) {
  const href = `/dashboard/jobs/${job.id}`;

  return (
    <li className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 border-t border-slate-100 py-3.5 first:border-t-0 first:pt-0 md:grid-cols-[2.75rem_minmax(0,1fr)_9.5rem_auto]">
      <CompanyLogo
        initials={job.companyInitials}
        color={job.companyColor}
        src={job.companyLogo}
        size="sm"
        className="rounded-xl text-xs"
      />

      <div className="min-w-0">
        <Link href={href} className="block truncate text-sm font-semibold text-slate-900 hover:text-primary-600">
          {job.title}
        </Link>
        <p className="truncate text-xs text-slate-500">{meta}</p>
        {note && <p className="truncate text-xs text-slate-500">{note}</p>}
      </div>

      {score !== null ? (
        <div className="col-start-2 grid gap-1 md:col-start-auto">
          <span className="flex justify-between text-xs text-slate-500">
            Phù hợp <b className="text-slate-800 tabular-nums">{score}%</b>
          </span>
          <Progress value={score} className="h-1.5" barClassName={score < 50 ? "bg-rose-500" : undefined} />
        </div>
      ) : (
        <span className="hidden md:block" />
      )}

      <div className="col-start-2 flex items-center gap-2 md:col-start-auto">
        <SaveButton jobId={job.id} initial={job.saved} />
        <Link
          href={href}
          className="flex h-9 items-center rounded-lg bg-primary-50 px-3.5 text-xs font-semibold whitespace-nowrap text-primary-700 hover:bg-primary-100"
        >
          {actionLabel}
        </Link>
      </div>
    </li>
  );
}

/** "Việc đang chờ bạn": 4 tin chấm điểm cao nhất mà người dùng chưa nộp đơn. */
export function TopMatches() {
  const { data } = useDashboard();
  if (!data) return null;

  const action = (
    <Link href="/dashboard/matches?sort=score_desc" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
      Xem tất cả
    </Link>
  );

  return (
    <Card>
      <DashSection title="Việc đang chờ bạn" icon={Target} action={action}>
        {data.pendingMatches.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có tin nào đã chấm mà bạn chưa ứng tuyển.</p>
        ) : (
          <ul>
            {data.pendingMatches.map((match) => {
              const job = toJobCard(match);
              return (
                <JobRow
                  key={match.jobId}
                  job={job}
                  score={match.overallScore}
                  meta={[job.company, job.location].filter(Boolean).join(" · ")}
                  note={null}
                  actionLabel="Ứng tuyển"
                />
              );
            })}
          </ul>
        )}
      </DashSection>
    </Card>
  );
}
