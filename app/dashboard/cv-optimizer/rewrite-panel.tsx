"use client";

import { Fragment } from "react";
import { ArrowsClockwise, WarningCircle } from "@phosphor-icons/react/ssr";
import { HOLE } from "@/lib/cv-checklist";
import type { BulletRewriteState } from "@/hooks/use-bullet-rewrite";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Câu gợi ý với ô số liệu `[__]` được tô để người dùng thấy chỗ phải tự điền. */
function WithHoles({ text }: { text: string }) {
  const parts = text.split(HOLE);
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <mark className="rounded border border-dashed border-amber-500 bg-amber-50 px-1 font-mono text-xs text-amber-800">
              __
            </mark>
          )}
          {part}
        </Fragment>
      ))}
    </>
  );
}

/** Nội dung khung "Gợi ý viết lại": đang viết, lỗi, hoặc các cách viết kèm nút "Dùng". */
export function RewritePanel({ rewrite }: { rewrite: BulletRewriteState }) {
  const { loading, result, error, ask, apply } = rewrite;

  if (loading) {
    return (
      <div className="space-y-3 p-3">
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-start gap-2 p-3 text-sm text-rose-800">
        <WarningCircle className="mt-0.5 size-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }
  if (!result) return null;

  return (
    <>
      <ul>
        {result.suggestions.map((suggestion) => (
          <li
            key={suggestion.text}
            className="border-t border-slate-100 p-3 first:border-t-0"
          >
            <p className="text-sm text-slate-900">
              <WithHoles text={suggestion.text} />
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {suggestion.keywords.length > 0 &&
                  `Từ khoá của tin: ${suggestion.keywords.join(", ")}`}
              </span>
              <Button size="sm" onClick={() => apply(suggestion.text)}>
                Dùng
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <span>Còn {result.remaining} lượt trong 24 giờ.</span>
        <Button
          variant="outline"
          size="sm"
          disabled={result.remaining === 0}
          onClick={() => void ask()}
        >
          <ArrowsClockwise className="size-3.5" />
          Viết khác
        </Button>
      </div>
    </>
  );
}
