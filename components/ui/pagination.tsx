"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/utils";

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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        <span className="font-mono font-semibold text-slate-700">
          {formatCount(from)}–{formatCount(to)}
        </span>{" "}
        trên tổng {formatCount(total)} {noun}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <CaretLeft className="size-4" />
          Trước
        </Button>
        <span className="font-mono text-xs text-slate-500">
          {page} / {pages}
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
