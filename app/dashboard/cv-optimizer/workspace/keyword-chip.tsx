"use client";

import { Check, X } from "@phosphor-icons/react/ssr";
import { withSkill } from "@/lib/cv-checklist";
import type { CvTodo } from "@/types";
import { useCvDraft } from "@/hooks/use-cv-draft";

/** Một từ khoá: đã có thì chip xanh; còn thiếu thì bấm để thêm vào Kỹ năng, hoặc bỏ qua. */
export function KeywordChip({ todo }: { todo: CvTodo }) {
  if (todo.done) {
    return (
      <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-primary-100 bg-primary-50 px-2.5 text-xs font-medium text-primary-700">
        <Check weight="bold" className="size-3" />
        {todo.label}
      </span>
    );
  }
  const add = () => {
    const { content, setContent } = useCvDraft.getState();
    setContent(withSkill(content, todo.label));
  };
  return (
    <span className="inline-flex h-7 items-center rounded-lg border border-dashed border-primary-200 bg-white text-xs font-semibold text-primary-600">
      <button
        type="button"
        onClick={add}
        className="h-full cursor-pointer rounded-l-lg pr-1 pl-2.5 hover:bg-primary-50"
      >
        + {todo.label}
      </button>
      <button
        type="button"
        aria-label={`Bỏ qua ${todo.label}`}
        title="Bỏ qua — không phải kỹ năng của bạn"
        onClick={() => useCvDraft.getState().skip(todo.label)}
        className="h-full cursor-pointer rounded-r-lg px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
