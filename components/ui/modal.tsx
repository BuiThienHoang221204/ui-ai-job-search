"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Hộp thoại có tiêu đề, đóng bằng Escape hoặc bấm ra ngoài. */
export function Modal({ open, onClose, title, children, className, bodyClassName }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 m-0 flex items-center justify-center bg-slab/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl bg-white shadow-xl",
          className,
        )}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5.5" />
          </button>
        </div>
        <div className={cn("px-6 pb-6", bodyClassName)}>{children}</div>
      </div>
    </div>
  );
}
