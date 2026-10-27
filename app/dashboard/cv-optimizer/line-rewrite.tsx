"use client";

import { useState } from "react";
import { Sparkle, X } from "@phosphor-icons/react/ssr";
import type { ActiveLine } from "@/hooks/use-cv-inline-edit";
import { useBulletRewrite } from "@/hooks/use-bullet-rewrite";
import { RewritePanel } from "./rewrite-panel";

/** Nút "Gợi ý viết lại" nổi trên chỗ viết lại được đang sửa (câu, đoạn, chức danh); bấm thì khung gợi ý mở ngay dưới câu đó. */
export function LineRewrite({
  line,
  scale,
}: {
  line: ActiveLine;
  scale: number;
}) {
  const [open, setOpen] = useState(false);
  const rewrite = useBulletRewrite(line.bullet, line.text);

  if (!open) {
    return (
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setOpen(true);
          void rewrite.ask();
        }}
        className="bg-primary-600 hover:bg-primary-700 absolute right-3 z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-white shadow-md"
        style={{ top: Math.max(0, line.top * scale - 30) }}
      >
        <Sparkle className="size-3.5" />
        Gợi ý viết lại
      </button>
    );
  }

  return (
    <div
      onMouseDown={(event) => event.preventDefault()}
      className="border-primary-200 absolute right-3 z-20 w-[26rem] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-lg border bg-white shadow-lg"
      style={{ top: line.bottom * scale + 6 }}
    >
      <div className="bg-primary-50 text-primary-700 flex items-center justify-between px-3 py-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <Sparkle className="size-3.5" />
          Gợi ý viết lại
        </span>
        <button
          type="button"
          aria-label="Đóng gợi ý"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded p-0.5 text-slate-500 hover:bg-white hover:text-slate-900"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <RewritePanel rewrite={rewrite} />
    </div>
  );
}
