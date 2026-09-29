"use client";

import { X } from "@phosphor-icons/react/ssr";

/** Một bộ lọc đang bật, kèm nút bỏ. */
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="bg-primary-50 text-primary-700 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Bỏ lọc ${label}`}
        className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-white/70"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}
