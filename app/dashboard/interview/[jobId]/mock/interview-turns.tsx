import { ChatCircleDots, Lightbulb } from "@phosphor-icons/react/ssr";
import { Markdown } from "@/components/ui/markdown";
import type { InterviewTurn } from "@/lib/interview-transcript";
import { cn } from "@/lib/cn";
import { AnswerBubble } from "./answer-bubble";
import { InterviewerAvatar } from "./interviewer-avatar";

/** Một lượt hỏi - đáp - nhận xét dạng hội thoại: câu hỏi bên trái, câu trả lời bên phải, nhận xét gắn ngay dưới. */
export function InterviewTurnBlock({
  turn,
  waiting,
}: {
  turn: InterviewTurn;
  waiting?: boolean;
}) {
  return (
    <li id={`turn-${turn.index}`} className="scroll-mt-18 space-y-4 lg:scroll-mt-4">
      <p className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold tracking-wide text-slate-400 before:h-px before:flex-1 before:bg-slate-100 after:h-px after:flex-1 after:bg-slate-100">
        CÂU {turn.index}
      </p>

      <div
        className={cn(
          "grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3",
          waiting &&
            "border-primary-200 from-primary-50 rounded-2xl border bg-linear-to-b to-white to-70% p-4",
        )}
      >
        <InterviewerAvatar active={waiting} />
        <div className="min-w-0">
          {waiting ? (
            <p className="text-primary-700 mb-1 flex items-center gap-1.5 text-[13px] font-semibold">
              <ChatCircleDots className="size-4" weight="fill" />
              Đến lượt bạn
            </p>
          ) : (
            <p className="mb-0.5 text-[13px] text-slate-500">Người phỏng vấn</p>
          )}
          <Markdown
            text={turn.question}
            className={cn(
              "leading-normal font-semibold text-slate-900",
              waiting ? "text-[17px]" : "text-base",
            )}
          />
        </div>
      </div>

      {turn.answer && <AnswerBubble text={turn.answer} />}

      {turn.feedback && (
        <div className="ml-11.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <Lightbulb className="size-4" weight="fill" />
            Nhận xét
          </p>
          <Markdown
            text={turn.feedback}
            className="mt-1 text-[15px] text-slate-700"
          />
        </div>
      )}
    </li>
  );
}
