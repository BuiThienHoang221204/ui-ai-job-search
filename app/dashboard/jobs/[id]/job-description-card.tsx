"use client";

import { useState } from "react";
import { ArrowSquareOut, CaretDown, FileText } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { portalName } from "@/lib/public-job";
import { cn } from "@/lib/cn";
import { useSession } from "@/hooks/use-session";

const LONG_ENOUGH_TO_FOLD = 900;

/** Thẻ mô tả công việc, gập lại khi nội dung quá dài. */
export function JobDescriptionCard({
  description,
  url,
  source,
  defaultOpen = false,
}: {
  description: string;
  url: string;
  source: string;
  defaultOpen?: boolean;
}) {
  const { user } = useSession();
  const [open, setOpen] = useState(defaultOpen);
  const foldable = description.length > LONG_ENOUGH_TO_FOLD;

  return (
    <SectionCard
      icon={FileText}
      title="Mô tả công việc"
      description={
        user
          ? "Nội dung nguyên văn từ tin tuyển dụng gốc"
          : "Đoạn đầu của tin tuyển dụng gốc"
      }
    >
      <div className={cn("relative", foldable && !open && "max-h-64 overflow-hidden")}>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">
          {description}
        </p>
        {foldable && !open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/0 to-white" />
        )}
      </div>

      {foldable && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <CaretDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          {open ? "Thu gọn mô tả" : "Xem toàn bộ mô tả"}
        </Button>
      )}

      {!user && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          Đọc tin đầy đủ trên {portalName(source)}
          <ArrowSquareOut className="size-4" />
        </a>
      )}
    </SectionCard>
  );
}
