"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Target } from "@phosphor-icons/react/ssr";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentDocuments } from "@/hooks/use-letters";

const LIMIT = 3;

/** Tin đã có CV viết riêng nhưng chưa có thư hay mail nào — bước tự nhiên tiếp theo. */
export function LetterSuggestions() {
  const cvs = useRecentDocuments("CV");
  const letters = useRecentDocuments("COVER_LETTER");
  const emails = useRecentDocuments("APPLICATION_EMAIL");

  const written = new Set(
    [...(letters.data?.items ?? []), ...(emails.data?.items ?? [])].map(
      (doc) => doc.jobId,
    ),
  );
  const items = (cvs.data?.items ?? [])
    .filter((cv) => cv.jobId && cv.job && !written.has(cv.jobId))
    .filter(
      (cv, index, list) =>
        list.findIndex((other) => other.jobId === cv.jobId) === index,
    )
    .slice(0, LIMIT);

  let content: ReactNode;
  if (!cvs.data) {
    content = <Skeleton className="h-32" />;
  } else if (items.length === 0) {
    content = (
      <p className="py-3 text-sm text-slate-500">
        Tin nào có CV riêng cũng đã có thư. Tối ưu CV cho tin mới ở trang Tối
        ưu CV.
      </p>
    );
  } else {
    content = (
      <ul>
        {items.map((cv) => (
          <li
            key={cv.id}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-3 first:border-t-0"
          >
            <CompanyLogo
              size="sm"
              src={cv.job?.companyLogo}
            />
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-semibold text-slate-900">
                {cv.job?.title}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {cv.job?.company} · CV{" "}
                {cv.language === "EN" ? "English" : "Tiếng Việt"}
              </span>
            </span>
            <Link
              href={`/dashboard/cover-letter?jobId=${cv.jobId}`}
              className="inline-flex h-8 items-center rounded-lg border border-dashed border-primary-200 px-2.5 text-xs font-semibold text-primary-600 hover:bg-primary-50"
            >
              + Viết thư
            </Link>
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
          Đã có CV, chưa có thư
        </h2>
      </div>
      {content}
      <p className="mt-2 text-xs text-slate-500">
        Thư nên đi cùng CV viết cho đúng tin đó, nên gợi ý ở đây là những tin
        bạn đã tối ưu CV.
      </p>
    </Card>
  );
}
