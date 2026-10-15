"use client";

import { useState } from "react";
import Link from "next/link";
import { Envelope, FileText } from "@phosphor-icons/react/ssr";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { DocumentStatusBadge } from "@/components/documents";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCvByJob, useRecentDocuments } from "@/hooks/use-letters";
import type { LetterKind, DocumentRecord } from "@/types";
import { companyColor, companyInitials } from "@/lib/company";
import { relativeTime } from "@/lib/date";

const KIND_META = {
  APPLICATION_EMAIL: {
    label: "Mail ứng tuyển",
    short: "Mail",
    icon: Envelope,
    className: "text-cyan-700",
  },
  COVER_LETTER: {
    label: "Thư xin việc",
    short: "Thư xin việc",
    icon: FileText,
    className: "text-primary-600",
  },
} as const;

const KINDS: LetterKind[] = ["APPLICATION_EMAIL", "COVER_LETTER"];

const PAGE_SIZE = 5;

const ADD_LINK =
  "inline-flex h-8.5 items-center rounded-lg border border-dashed border-primary-200 px-3 text-sm font-semibold text-primary-600 hover:bg-primary-50";

/** Gom thư và mail theo tin; mail viết từ mô tả dán tay (không có tin) đứng riêng từng cái. */
function groupByJob(docs: DocumentRecord[]): DocumentRecord[][] {
  const groups = new Map<string, DocumentRecord[]>();
  for (const doc of docs) {
    const key = doc.jobId ?? `pasted:${doc.id}`;
    groups.set(key, [...(groups.get(key) ?? []), doc]);
  }
  return [...groups.values()];
}

/** Thư và mail đã viết, gom theo tin để thấy ngay tin nào còn thiếu loại nào. */
export function LetterList() {
  const letters = useRecentDocuments("COVER_LETTER");
  const emails = useRecentDocuments("APPLICATION_EMAIL");
  const cvByJob = useCvByJob();
  const [offset, setOffset] = useState(0);

  if (!letters.data || !emails.data) {
    return (
      <Card className="p-6">
        <Skeleton className="h-40" />
      </Card>
    );
  }

  const groups = groupByJob([...emails.data.items, ...letters.data.items]);

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center gap-2.5">
        <Envelope className="size-5 text-primary-600" />
        <h2 className="flex-1 text-base font-semibold text-slate-900">
          Thư của bạn
        </h2>
        <span className="text-xs text-slate-500">Gom theo tin</span>
      </div>

      {groups.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Bạn chưa viết thư nào. Chọn một tin ở trên rồi bấm viết.
        </p>
      ) : (
        <ul>
          {groups.slice(offset, offset + PAGE_SIZE).map((items) => {
            const first = items[0];
            const company = first.job?.company ?? first.title;
            const jobId = first.jobId;
            const cv = jobId ? cvByJob.get(jobId) : undefined;
            const missing = KINDS.filter(
              (kind) => !items.some((item) => item.kind === kind),
            );
            return (
              <li
                key={first.jobId ?? first.id}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-slate-100 py-3.5 first:border-t-0 md:grid-cols-[2.75rem_minmax(0,1fr)_auto]"
              >
                <CompanyLogo
                  size="sm"
                  initials={companyInitials(company)}
                  color={companyColor(company)}
                  src={first.job?.companyLogo}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {first.job?.title ?? "Mô tả dán tay"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{company}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((item) => {
                      const meta = KIND_META[item.kind as LetterKind];
                      const Icon = meta.icon;
                      return (
                        <Link
                          key={item.id}
                          href={`/dashboard/cover-letter?doc=${item.id}`}
                          className="inline-flex h-8.5 items-center gap-2 rounded-lg border border-slate-200 bg-white max-w-full px-3 text-sm font-medium whitespace-nowrap text-slate-700 hover:border-primary-200 hover:bg-primary-50"
                        >
                          <Icon
                            className={`size-4 shrink-0 ${meta.className}`}
                          />
                          <span className="truncate">
                            {meta.label} ·{" "}
                            {relativeTime(item.generatedAt ?? item.createdAt)}
                          </span>
                          <span className="shrink-0">
                            <DocumentStatusBadge status={item.status} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {jobId && (
                  <div className="col-start-2 flex flex-wrap items-start gap-2 md:col-start-3 md:justify-end">
                    {cv ? (
                      <Link
                        href={`/dashboard/cv-optimizer?doc=${cv.id}`}
                        className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <FileText className="size-4" />
                        Mở CV của tin
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/cv-optimizer?jobId=${jobId}`}
                        className={ADD_LINK}
                      >
                        + Tạo CV
                      </Link>
                    )}
                    {missing.map((kind) => (
                      <Link
                        key={kind}
                        href={`/dashboard/cover-letter?jobId=${jobId}&kind=${kind}`}
                        className={ADD_LINK}
                      >
                        + {KIND_META[kind].short}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Pagination
        offset={offset}
        limit={PAGE_SIZE}
        total={groups.length}
        onOffsetChange={setOffset}
        noun="tin"
      />
    </Card>
  );
}
