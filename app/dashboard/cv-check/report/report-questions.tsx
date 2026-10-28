import { ArrowRight, CaretDown } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { QUESTION_LEVEL_LABELS } from "@/lib/cv-check";
import type { CvReview } from "@/types";

const LEVEL_BADGE = {
  basic: "success",
  intermediate: "warning",
  advanced: "danger",
} as const;

/** Câu hỏi phỏng vấn dự đoán từ CV: lý do được hỏi, gợi ý trả lời mở/đóng, lối sang luyện phỏng vấn. */
export function ReportQuestions({
  questions,
  onPractice,
}: {
  questions: CvReview["questions"];
  onPractice: () => void;
}) {
  return (
    <Card className="mt-3 divide-y divide-slate-200">
      {questions.map((item) => (
        <div key={item.question} className="px-5 py-4.5">
          <h4 className="leading-relaxed font-semibold text-slate-900">
            {item.question}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{item.topic}</Badge>
            <Badge variant={LEVEL_BADGE[item.level]}>
              {QUESTION_LEVEL_LABELS[item.level]}
            </Badge>
          </div>
          <p className="mt-2.5 text-sm text-slate-600">
            <b className="text-slate-900">Vì sao câu này được hỏi:</b>{" "}
            {item.why}
          </p>
          <div className="mt-2.5 flex flex-wrap items-start justify-between gap-3">
            <details className="group min-w-0 flex-1">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-slate-700">
                Gợi ý trả lời
                <CaretDown className="size-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-1.5 text-sm text-slate-600">{item.hint}</p>
            </details>
            <button
              type="button"
              onClick={onPractice}
              className="text-primary-600 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold hover:underline"
            >
              Luyện phỏng vấn
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </Card>
  );
}
