"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Target } from "@phosphor-icons/react/ssr";
import { documentsService, matchesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CvGenerate } from "@/types";
import { CV_PAGE_SIZE } from "./cv-list";
import { cn } from "@/lib/cn";
import { matchTone } from "@/lib/score";

const SUGGESTION_LIMIT = 8;

const SCORE_TONES = {
  good: "text-emerald-600",
  mid: "text-amber-600",
  low: "text-rose-600",
} as const;

/** Tin điểm cao nhất mà bạn chưa có CV nào; một bấm là AI viết CV cho tin đó. */
export function SuggestedJobs({ onGenerate }: { onGenerate: CvGenerate }) {
  const matches = useApiQuery(
    keys.matchPage(SUGGESTION_LIMIT, 0, "score_desc"),
    () => matchesService.list({ limit: SUGGESTION_LIMIT, sort: "score_desc" }),
    { errorMessage: "Không tải được tin phù hợp" },
  );
  const documents = useApiQuery(
    keys.documentList("CV", null, 0),
    () =>
      documentsService.list("CV", undefined, {
        limit: CV_PAGE_SIZE,
        offset: 0,
      }),
    { errorMessage: "Không tải được danh sách CV" },
  );
  const withCv = new Set(
    documents.data?.items.map((document) => document.jobId),
  );
  const items = (matches.data?.items ?? [])
    .filter((match) => !withCv.has(match.jobId))
    .slice(0, 3);

  let content: ReactNode;
  if (!matches.data) {
    content = <Skeleton className="h-40" />;
  } else if (items.length === 0) {
    content = (
      <p className="py-4 text-sm text-slate-500">
        Tin bạn hợp nhất đều đã có CV. Chấm thêm tin ở trang Việc làm phù hợp.
      </p>
    );
  } else {
    content = (
      <ul>
        {items.map((match) => (
          <li
            key={match.jobId}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-3 first:border-t-0"
          >
            <CompanyLogo
              size="sm"
              src={match.job.companyLogo}
            />
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-semibold text-slate-900">
                {match.job.title}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {match.job.company}
                {match.overallScore !== null && (
                  <>
                    {" · "}
                    <b
                      className={cn(
                        "font-mono",
                        SCORE_TONES[matchTone(match.overallScore)],
                      )}
                    >
                      {match.overallScore}%
                    </b>{" "}
                    phù hợp
                  </>
                )}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onGenerate({ jobId: match.jobId }, "vi")}
              className="h-8 cursor-pointer rounded-lg border border-dashed border-primary-200 px-2.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Tạo CV
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-2 flex items-center gap-2.5">
        <Target className="size-5 text-primary-600" />
        <h2 className="text-base font-semibold text-slate-900">
          Tin phù hợp chưa có CV
        </h2>
      </div>

      {content}

      <Link
        href="/dashboard/jobs?scored=1"
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        Xem việc làm phù hợp
        <ArrowRight className="size-4" />
      </Link>
    </Card>
  );
}
