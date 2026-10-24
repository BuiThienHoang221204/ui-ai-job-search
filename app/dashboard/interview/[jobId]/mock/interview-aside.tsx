"use client";

import { Check } from "@phosphor-icons/react/ssr";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { useJobDetail } from "@/hooks/use-job-detail";
import {
  pendingTurn,
  type InterviewTranscript,
} from "@/lib/interview-transcript";
import { cn } from "@/lib/cn";

const STAR_STEPS = [
  { letter: "S", title: "Bối cảnh", hint: "Dự án, đội, thời điểm." },
  { letter: "T", title: "Nhiệm vụ", hint: "Phần việc của riêng bạn." },
  { letter: "A", title: "Hành động", hint: "Bạn đã làm gì, vì sao." },
  { letter: "R", title: "Kết quả", hint: "Một con số nếu có." },
];

/** Cột phải của buổi luyện: vị trí và thanh tiến độ, dòng thời gian các câu đã hỏi, khung STAR. */
export function InterviewAside({
  jobId,
  transcript,
}: {
  jobId: string;
  transcript: InterviewTranscript | null;
}) {
  const job = useJobDetail(jobId).data?.job;
  const turns = transcript?.turns ?? [];
  const answered = turns.filter((turn) => turn.answer !== null).length;
  const current = transcript ? pendingTurn(transcript) : null;

  return (
    <aside className="grid gap-3.5 lg:sticky lg:top-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 p-4">
          <CompanyLogo src={job?.companyLogo} size="sm" />
          <div className="min-w-0">
            <p className="leading-snug font-semibold text-slate-900">
              {job?.title}
            </p>
            <p className="truncate text-[13px] text-slate-500">
              {job?.company}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 pt-3 pb-3.5">
          <div className="flex items-baseline justify-between gap-2 text-[13px] text-slate-500">
            <p>
              <span className="font-display mr-1 text-xl text-slate-900">
                {answered}
              </span>
              câu đã trả lời
            </p>
            {current && <p>Đang hỏi câu {current.index}</p>}
          </div>
          {turns.length > 0 && (
            <div className="mt-2 flex gap-1">
              {turns.map((turn) => (
                <span
                  key={turn.index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    turn.answer === null ? "bg-primary-600" : "bg-emerald-600",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {turns.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white">
          <h3 className="flex items-center justify-between px-4 pt-3.5 pb-1.5 text-[15px] font-semibold text-slate-900">
            Các câu đã hỏi
            <span className="font-mono text-xs text-slate-400">
              {turns.length}
            </span>
          </h3>
          <ol className="px-3 pt-1 pb-3">
            {turns.map((turn) => {
              const now = turn.answer === null;
              return (
                <li
                  key={turn.index}
                  className="relative not-last:after:absolute not-last:after:top-9 not-last:after:-bottom-1.5 not-last:after:left-[1.125rem] not-last:after:w-0.5 not-last:after:bg-slate-100"
                >
                  <a
                    href={`#turn-${turn.index}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document
                        .getElementById(`turn-${turn.index}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "grid grid-cols-[1.625rem_minmax(0,1fr)] gap-2.5 rounded-xl px-1.5 py-2 text-sm leading-snug",
                      now
                        ? "bg-primary-50 text-primary-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {now ? (
                      <span className="bg-primary-600 ring-primary-100 relative z-10 flex size-6.5 items-center justify-center rounded-full font-mono text-xs font-semibold text-white ring-4">
                        {turn.index}
                      </span>
                    ) : (
                      <span className="relative z-10 flex size-6.5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                        <Check className="size-3.5" weight="bold" />
                      </span>
                    )}
                    <span className="line-clamp-2">{turn.question}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">
        <h3 className="px-4 pt-3.5 pb-1.5 text-[15px] font-semibold text-slate-900">
          Khung trả lời STAR
        </h3>
        <ol className="grid grid-cols-2 gap-2 px-4 pt-1 pb-4">
          {STAR_STEPS.map((step) => (
            <li key={step.letter} className="rounded-xl bg-slate-50 p-2.5">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold whitespace-nowrap text-slate-900">
                <span className="text-primary-700 ring-primary-100 flex size-5.5 items-center justify-center rounded-md bg-white font-mono text-xs font-bold ring-1 ring-inset">
                  {step.letter}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-slate-500">
                {step.hint}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
