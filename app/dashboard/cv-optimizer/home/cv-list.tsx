"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText } from "@phosphor-icons/react/ssr";
import { documentsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { DocumentStatusBadge } from "@/components/documents";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperThumb } from "./paper-thumb";
import { relativeTime } from "@/lib/date";

export const CV_PAGE_SIZE = 8;

/** Các CV đã tạo, mới nhất trước; bấm một dòng để mở khu sửa CV. */
export function CvList() {
  const [offset, setOffset] = useState(0);
  const { data, error } = useApiQuery(
    keys.documentList("CV", null, offset),
    () =>
      documentsService.list("CV", undefined, { limit: CV_PAGE_SIZE, offset }),
    { errorMessage: "Không tải được danh sách CV", keepPrevious: true },
  );

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <FileText className="size-5 text-primary-600" />
        <h2 className="flex-1 text-base font-semibold text-slate-900">
          CV của bạn
        </h2>
        {data && (
          <span className="text-xs text-slate-500">{data.total} bản</span>
        )}
      </div>

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !data ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : data.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Bạn chưa tạo CV nào. Chọn một tin ở trên rồi bấm “Tạo CV bằng AI”.
        </p>
      ) : (
        <ul className="-mx-3">
          {data.items.map((document) => (
            <li
              key={document.id}
              className="border-t border-slate-100 first:border-t-0"
            >
              <Link
                href={`/dashboard/cv-optimizer?doc=${document.id}`}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
              >
                <PaperThumb accent={document.templateOptions?.accent} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {document.job?.title ?? document.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {document.job?.company ?? "Không nhắm tin nào"}
                    {" · "}
                    {document.language === "EN" ? "English" : "Tiếng Việt"}
                    {" · "}
                    {relativeTime(document.generatedAt ?? document.createdAt)}
                  </span>
                </span>
                <DocumentStatusBadge status={document.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <Pagination
          offset={offset}
          limit={CV_PAGE_SIZE}
          total={data.total}
          noun="CV"
          onOffsetChange={setOffset}
        />
      )}
    </Card>
  );
}
