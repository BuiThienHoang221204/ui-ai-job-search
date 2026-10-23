"use client";

import { useState } from "react";
import {
  Books,
  Briefcase,
  CaretDown,
  Check,
  CheckCircle,
  Copy,
  Heart,
  ListChecks,
  Sparkle,
  UserSound,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/cn";
import type { QuestionSummary, QuestionType } from "@/types";
import { DifficultyBadge } from "./difficulty-badge";
import { QuestionAnswer } from "./question-answer";

const TYPE_ICONS: Record<QuestionType, Icon> = {
  KIEN_THUC: Books,
  QUY_TRINH: ListChecks,
  HANH_VI: UserSound,
  DONG_CO: Heart,
};

/** Một câu hỏi: số thứ tự, tiêu đề kèm nút copy, ngành · loại · trạng thái đáp án, nhãn độ khó; bấm để mở phần đáp án. */
export function QuestionRow({ question, number }: { question: QuestionSummary; number: number }) {
  const [open, setOpen] = useState(false);
  const { copied, copy } = useCopy();
  const TypeIcon = question.type ? TYPE_ICONS[question.type] : null;
  const toggle = () => setOpen((was) => !was);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white transition-colors",
        open ? "border-primary-200 shadow-sm" : "border-slate-200/80 hover:border-slate-300",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          toggle();
        }}
        className="grid cursor-pointer grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-3 py-4 pr-4 pl-3 select-none focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        <span
          className={cn(
            "pt-0.5 text-right font-mono text-[13px] leading-6 font-semibold",
            open ? "text-primary-600" : "text-slate-400",
          )}
        >
          #{number}
        </span>

        <div className="min-w-0">
          <p className="text-base leading-snug font-semibold text-slate-900">
            {question.text}
            <button
              type="button"
              title="Copy câu hỏi"
              aria-label="Copy câu hỏi"
              onClick={(event) => {
                event.stopPropagation();
                copy(question.id, question.text);
              }}
              className="ml-1.5 inline-flex cursor-pointer rounded-md p-0.5 align-[-2px] text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              {copied === question.id ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
            {question.industryName && (
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-3.5 text-slate-400" />
                {question.industryName}
              </span>
            )}
            {question.typeName && TypeIcon && (
              <span className="inline-flex items-center gap-1">
                <TypeIcon className="size-3.5 text-slate-400" />
                {question.typeName}
              </span>
            )}
            {question.answeredAt ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle className="size-3.5" />
                Có đáp án
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Sparkle className="size-3.5 text-slate-400" />
                AI soạn khi mở
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {question.difficulty && <DifficultyBadge difficulty={question.difficulty} />}
          <CaretDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              open ? "rotate-180 text-primary-600" : "text-slate-400",
            )}
          />
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 pt-4 pb-5 sm:pl-[3.75rem]">
          <QuestionAnswer question={question} />
        </div>
      )}
    </div>
  );
}
