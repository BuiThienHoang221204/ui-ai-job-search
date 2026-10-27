"use client";

import { useState } from "react";
import { Hash, Sparkle, X } from "@phosphor-icons/react/ssr";
import { bulletPath } from "@/lib/cv-checklist";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { useBulletRewrite } from "@/hooks/use-bullet-rewrite";
import { Button } from "@/components/ui/button";
import type { CvBullet, CvTodo } from "@/types";
import { RewritePanel } from "../rewrite-panel";

/** Một câu kinh nghiệm chưa có số liệu; "Gợi ý viết lại" cho vài cách viết bám tin, số liệu để trống cho người dùng điền. */
export function MetricRow({
  todo,
  bullet,
}: {
  todo: CvTodo;
  bullet: CvBullet;
}) {
  const [open, setOpen] = useState(false);
  const rewrite = useBulletRewrite(bullet, todo.label);

  return (
    <li className="border-t border-slate-100 py-2.5 first:border-t-0">
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Hash className="size-4" />
        </span>
        <button
          type="button"
          onClick={() =>
            useCvDraft.getState().goTo(todo.section, bulletPath(bullet))
          }
          className="min-w-0 cursor-pointer text-left"
        >
          <span className="block truncate text-sm font-semibold text-slate-900">
            “{todo.label}”
          </span>
          <span className="block truncate text-xs text-slate-500">
            {todo.hint}
          </span>
        </button>
        {open ? (
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <X className="size-3.5" />
            Đóng
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setOpen(true);
              void rewrite.ask();
            }}
          >
            <Sparkle className="size-3.5" />
            Gợi ý viết lại
          </Button>
        )}
      </div>
      {open && (
        <div className="mt-2.5 ml-11 overflow-hidden rounded-lg border border-primary-200 bg-white">
          <RewritePanel rewrite={rewrite} />
        </div>
      )}
    </li>
  );
}
