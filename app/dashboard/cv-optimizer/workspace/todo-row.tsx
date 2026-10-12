"use client";

import type { Icon } from "@phosphor-icons/react";
import { CaretRight } from "@phosphor-icons/react/ssr";
import type { CvTodo } from "@/types";
import { useCvDraft } from "@/hooks/use-cv-draft";

/** Một việc cần sửa; bấm thì mở đúng mục trong trình sửa. */
export function TodoRow({ todo, icon: Icon }: { todo: CvTodo; icon: Icon }) {
  return (
    <li className="border-t border-slate-100 first:border-t-0">
      <button
        type="button"
        onClick={() => useCvDraft.getState().openEditor(todo.section)}
        className="group grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)_1rem] items-center gap-3 py-2.5 text-left"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {todo.kind === "metric" ? `“${todo.label}”` : todo.label}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {todo.hint}
          </span>
        </span>
        <CaretRight className="size-4 text-slate-300 group-hover:text-primary-600" />
      </button>
    </li>
  );
}
