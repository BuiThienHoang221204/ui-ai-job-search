"use client";

import { type RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, CheckCircle, Sparkle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface ApplyBarProps {
  watch: RefObject<HTMLElement | null>;
  submitted: boolean;
  saved: boolean;
  onApply: () => void;
  onToggleSave: () => void;
}

/** Thanh ứng tuyển dính đáy màn hình trên mobile, chỉ hiện khi phần đầu tin (`watch`) đã cuộn khuất. Gắn thẳng vào `body` vì khung trang có lớp tạo khối chứa riêng làm `fixed` lệch khỏi đáy màn hình. */
export function ApplyBar({ watch, submitted, saved, onApply, onToggleSave }: ApplyBarProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = watch.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [watch]);

  return createPortal(
    <div
      aria-hidden={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-slate-200 bg-white/95 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur-md transition-transform duration-200 lg:hidden",
        shown ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <Button className="flex-1" onClick={onApply} variant={submitted ? "outline" : "primary"} tabIndex={shown ? 0 : -1}>
        {submitted ? <CheckCircle className="size-4.5 text-emerald-600" /> : <Sparkle className="size-4.5" />}
        {submitted ? "Đã nộp · Mở tin gốc" : "Ứng tuyển ngay"}
      </Button>
      <Button
        variant="outline"
        onClick={onToggleSave}
        aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
        tabIndex={shown ? 0 : -1}
      >
        <Bookmark className={cn("size-4.5", saved && "fill-primary-600 text-primary-600")} />
      </Button>
    </div>,
    document.body,
  );
}
