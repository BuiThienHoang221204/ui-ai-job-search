"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Compass,
  Copy,
  Lightbulb,
  ListChecks,
  Quotes,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { questionBankService } from "@/services/question-bank";
import { keys } from "@/lib/query-keys";
import { useCopy } from "@/hooks/use-copy";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuestionSummary } from "@/types";

/** Phần đáp án của một câu hỏi: câu đã có đáp án thì mở ra là hiện ngay; câu chưa có thì chỉ gọi model soạn khi người dùng bấm. */
export function QuestionAnswer({ question }: { question: QuestionSummary }) {
  const [requested, setRequested] = useState(false);
  const answer = useQuery({
    queryKey: keys.questionAnswer(question.id),
    queryFn: () => questionBankService.answer(question.id),
    enabled: question.answeredAt !== null || requested,
    staleTime: Infinity,
  });
  const detail = answer.data;
  const { copied, copy } = useCopy();

  if (answer.isFetching) {
    return (
      <div className="space-y-3 pt-1">
        {!question.answeredAt && (
          <p className="text-xs text-slate-500">
            Đang soạn gợi ý trả lời… lần đầu có thể mất vài chục giây.
          </p>
        )}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (answer.isError) {
    return (
      <Alert
        tone="danger"
        actions={
          <Button size="sm" variant="outline" onClick={() => void answer.refetch()}>
            Thử lại
          </Button>
        }
      >
        Chưa lấy được gợi ý trả lời. Thử lại sau ít phút.
      </Alert>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button size="sm" onClick={() => setRequested(true)}>
          <Sparkle className="size-4" weight="fill" />
          Soạn gợi ý trả lời
        </Button>
        {!question.answeredAt && (
          <span className="text-xs text-slate-500">
            Chưa ai mở câu này, gợi ý sẽ được soạn ngay bây giờ.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {detail.why && (
        <p className="text-[15px] leading-relaxed text-slate-800">
          <span className="font-semibold text-slate-900">Vì sao nhà tuyển dụng hỏi: </span>
          {detail.why}
        </p>
      )}

      {detail.keyPoints.length > 0 && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <ListChecks className="size-4 text-primary-600" />
            Ý cần chạm tới
          </h4>
          <ul className="space-y-1.5">
            {detail.keyPoints.map((point) => (
              <li key={point} className="flex gap-2 text-[15px] leading-relaxed text-slate-700">
                <Check className="mt-0.5 size-4 shrink-0 text-primary-600" weight="bold" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.answerGuide && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Compass className="size-4 text-primary-600" />
            Hướng trả lời
          </h4>
          <p className="text-[15px] leading-relaxed text-slate-700">{detail.answerGuide}</p>
        </section>
      )}

      {detail.sampleAnswer ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-700">
              <Quotes className="size-4" weight="fill" />
              Đáp án mẫu
            </span>
            <button
              type="button"
              onClick={() => copy("sample", detail.sampleAnswer)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              {copied === "sample" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copied === "sample" ? "Đã copy" : "Copy"}
            </button>
          </div>
          <p className="px-3.5 py-3 text-[15px] leading-relaxed whitespace-pre-line text-slate-800">
            {detail.sampleAnswer}
          </p>
        </section>
      ) : (
        <p className="flex gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2.5 text-sm text-slate-700">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary-600" />
          <span>
            Câu này không có đáp án mẫu, và đó là chủ đích: câu trả lời phải là trải nghiệm có thật
            của bạn. Hãy kể theo khung{" "}
            <strong>tình huống → nhiệm vụ → hành động → kết quả</strong>, kèm một con số nếu có.
          </span>
        </p>
      )}

      {!detail.verified && (
        <p className="flex items-center gap-1.5 text-[13px] text-amber-700">
          <WarningCircle className="size-3.5" />
          Gợi ý do AI soạn, chưa có người rà lại. Hãy đối chiếu với kinh nghiệm thật của bạn.
        </p>
      )}
    </div>
  );
}
