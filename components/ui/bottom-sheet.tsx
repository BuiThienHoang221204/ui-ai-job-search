"use client";

import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react/ssr";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/cn";

/** Bảng trượt lên từ đáy màn hình cho mobile: nền mờ, thanh kéo, tiêu đề, nội dung cuộn và chân cố định tuỳ chọn. */
export function BottomSheet({
  title,
  onClose,
  children,
  footer,
  heightClass = "h-[50dvh]",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  heightClass?: string;
}) {
  useScrollLock(true);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-modal-backdrop absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        className={cn(
          "animate-sheet-up relative flex flex-col rounded-t-2xl bg-white",
          heightClass,
        )}
      >
        <div className="shrink-0 px-5 pt-2">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" />
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

/** Một nhóm bộ lọc trong sheet: nhãn nhóm viết hoa và hàng chip xuống dòng. */
export function SheetSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-slate-100 py-3 first:border-t-0 first:pt-0">
      <p className="text-2xs mb-2 font-bold tracking-widest text-slate-500 uppercase">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Chip chọn/bỏ chọn trong sheet lọc. */
export function SheetChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary-400 bg-primary-50 text-primary-700"
          : "border-slate-200 bg-white text-slate-700",
      )}
    >
      {children}
    </button>
  );
}
