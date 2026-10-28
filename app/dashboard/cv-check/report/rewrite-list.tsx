"use client";

import { Card } from "@/components/ui/card";
import { useCopy } from "@/hooks/use-copy";
import type { CvReviewIssue } from "@/types";

const HOLE = /(\[__\])/;

/** Câu nên viết lại: lỗi, cách sửa, câu trong CV và câu viết mẫu có ô số liệu để trống. */
export function RewriteList({ issues }: { issues: CvReviewIssue[] }) {
  const { copied, copy } = useCopy();

  return (
    <Card className="mt-3 divide-y divide-slate-200">
      {issues.map((issue, index) => {
        const key = `${issue.title}-${issue.quote}`;
        return (
          <div key={key} className="px-5 py-4.5">
            <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5">
              <span className="mt-0.5 grid size-5.5 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h4 className="font-semibold text-slate-900">{issue.title}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  <b className="text-slate-900">Cách sửa:</b> {issue.why}
                </p>
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 text-sm sm:ml-8">
              <div className="grid gap-1 bg-slate-50 px-3.5 py-3 text-slate-600 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-3">
                <span className="text-xs font-semibold text-rose-600">
                  Câu trong CV
                </span>
                <span>{issue.quote}</span>
              </div>
              {issue.rewrite && (
                <div className="grid gap-1 border-t border-slate-200 px-3.5 py-3 text-slate-900 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:gap-3">
                  <span className="text-xs font-semibold text-emerald-600">
                    Gợi ý viết lại
                  </span>
                  <span>
                    {issue.rewrite.split(HOLE).map((part, partIndex) =>
                      part === "[__]" ? (
                        <span
                          key={partIndex}
                          className="rounded border border-dashed border-amber-500 bg-amber-50 px-1 font-mono text-xs font-bold text-amber-600"
                        >
                          {part}
                        </span>
                      ) : (
                        part
                      ),
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(key, issue.rewrite)}
                    className="text-primary-600 cursor-pointer self-start text-xs font-semibold hover:underline"
                  >
                    {copied === key ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
