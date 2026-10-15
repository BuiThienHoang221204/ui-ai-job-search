"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDown, Check, Target } from "@phosphor-icons/react/ssr";
import { useLearningActions } from "@/hooks/use-learning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SkillGapItem } from "@/types";
import { cn } from "@/lib/cn";

/** Một kỹ năng còn thiếu: số tin cần nó, các tin gần đạt, và ba lựa chọn học / đã biết / không quan tâm. */
export function SkillGapCard({
  gap,
  jobsAnalysed,
}: {
  gap: SkillGapItem;
  jobsAnalysed: number;
}) {
  const { busyKey, learn, know, skip } = useLearningActions();
  const [showJobs, setShowJobs] = useState(false);
  const busy = busyKey === gap.key;
  const learning = gap.status === "LEARNING";
  const percent = jobsAnalysed ? Math.round((gap.demand / jobsAnalysed) * 100) : 0;

  return (
    <article
      className={cn(
        "rounded-xl border p-4",
        learning ? "border-primary-200 bg-primary-50/40" : "border-slate-200/80",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900">{gap.name}</h3>
        <Badge variant="outline">{gap.kind === "REQUIRED" ? "Bắt buộc" : "Ưu tiên"}</Badge>
        {learning && <Badge variant="primary">Đang học</Badge>}
      </div>

      <p className="mt-1.5 text-sm text-slate-600">
        {gap.near > 0 ? (
          <>
            Có trong <strong className="font-semibold text-emerald-700">{gap.near} tin</strong> bạn
            đã khớp từ một nửa yêu cầu trở lên.
          </>
        ) : (
          "Chưa có tin nào bạn gần đạt cần kỹ năng này."
        )}
      </p>

      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
        <Progress value={percent} className="h-1.5 flex-1" />
        <span className="shrink-0">
          {gap.demand}/{jobsAnalysed} tin yêu cầu
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {learning ? (
          <a href={`#plan-${encodeURIComponent(gap.key)}`}>
            <Button size="sm" variant="outline">
              <Target className="size-4" />
              Xem trong kế hoạch
            </Button>
          </a>
        ) : (
          <>
            <Button size="sm" loading={busy} onClick={() => void learn(gap)}>
              {!busy && <Target className="size-4" />}
              Học kỹ năng này
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void know(gap)}>
              <Check className="size-4" />
              Tôi đã biết
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void skip(gap)}>
              Không quan tâm
            </Button>
          </>
        )}
        {gap.jobs.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => setShowJobs((open) => !open)}
            aria-expanded={showJobs}
          >
            {showJobs ? "Ẩn tin" : `Xem ${gap.jobs.length} tin`}
            <CaretDown className={cn("size-4 transition-transform", showJobs && "rotate-180")} />
          </Button>
        )}
      </div>

      {showJobs && (
        <ul className="mt-3 space-y-1.5 rounded-lg bg-slate-50 px-3 py-2.5">
          {gap.jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/dashboard/jobs/${job.id}`}
                className="block truncate text-sm text-slate-700 hover:text-primary-700"
              >
                <span className="font-medium">{job.title}</span>
                <span className="text-slate-400"> · {job.company}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
