import { Lightbulb } from "@phosphor-icons/react/ssr";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/utils";
import type { InterviewTurn } from "@/lib/interview-transcript";

/** Một lượt hỏi - đáp - nhận xét, dựng như một trang biên bản. */
export function InterviewTurnBlock({
  turn,
  waiting,
}: {
  turn: InterviewTurn;
  waiting?: boolean;
}) {
  return (
    <li className="grid grid-cols-[2.25rem_1fr] gap-x-3 gap-y-2">
      <span
        className={cn(
          "mt-0.5 flex size-7 items-center justify-center rounded-full font-mono text-xs font-medium tabular-nums",
          waiting
            ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
            : "bg-slate-100 text-slate-600",
        )}
        aria-hidden
      >
        {turn.index}
      </span>

      <div className="min-w-0 space-y-3">
        <div>
          <p className="text-[0.6875rem] font-medium tracking-wide text-slate-500 uppercase">
            Người phỏng vấn
          </p>
          <Markdown
            text={turn.question}
            className="mt-1 text-[0.9375rem] font-medium text-slate-900"
          />
        </div>

        {turn.answer && (
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-3">
            <p className="text-[0.6875rem] font-medium tracking-wide text-slate-500 uppercase">
              Bạn trả lời
            </p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
              {turn.answer}
            </p>
          </div>
        )}

        {turn.feedback && (
          <div className="border-primary-300 flex gap-2.5 border-l-2 py-0.5 pl-3">
            <Lightbulb className="text-primary-600 mt-0.5 size-4.5 shrink-0" />
            <Markdown text={turn.feedback} className="min-w-0 text-slate-600" />
          </div>
        )}
      </div>
    </li>
  );
}
