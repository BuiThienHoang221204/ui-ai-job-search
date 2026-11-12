"use client";

import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/number";

interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onOffsetChange: (offset: number) => void;
  noun?: string;
  disabled?: boolean;
}

/** Phân trang theo offset, hiện khoảng bản ghi đang xem trên tổng số. */
export function Pagination({
  offset,
  limit,
  total,
  onOffsetChange,
  noun = "kết quả",
  disabled,
}: PaginationProps) {
  const root = useRef<HTMLDivElement>(null);
  if (total <= limit) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.ceil(total / limit);
  const go = (next: number) => {
    onOffsetChange(next);
    revealListTop(root.current);
  };

  return (
    <div ref={root} className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-1.5">
      <p className="truncate text-xs text-slate-500">
        <span className="font-mono font-semibold text-slate-700">
          {formatCount(from)}–{formatCount(to)}
        </span>{" "}
        / {formatCount(total)} {noun}
      </p>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Trang trước"
          title="Trang trước"
          disabled={disabled || offset === 0}
          onClick={() => go(Math.max(0, offset - limit))}
        >
          <CaretLeft className="size-4" />
        </Button>
        <span className="text-xs whitespace-nowrap text-slate-500 tabular-nums">
          Trang {page}/{pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || to >= total}
          onClick={() => go(offset + limit)}
        >
          Sau
          <CaretRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** Lật trang khi đang ở cuối danh sách thì đưa đầu khối chứa danh sách lên lại màn hình, thay vì để người dùng đứng ở cuối trang mới. */
function revealListTop(bar: HTMLElement | null) {
  const viewTop = bar?.closest("main")?.getBoundingClientRect().top ?? 0;
  for (let el = bar?.parentElement; el && el.tagName !== "MAIN"; el = el.parentElement) {
    if (el.getBoundingClientRect().top < viewTop) {
      el.scrollIntoView({ block: "start" });
      return;
    }
  }
}
