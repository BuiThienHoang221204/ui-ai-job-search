"use client";

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
  if (total <= limit) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.ceil(total / limit);

  return (
    <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-1.5">
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
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
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
          onClick={() => onOffsetChange(offset + limit)}
        >
          Sau
          <CaretRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
