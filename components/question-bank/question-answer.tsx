"use client";

import { useState } from "react";
import { Lightbulb, Sparkle } from "@phosphor-icons/react/ssr";
import {
  questionBankService,
  type QuestionDetail,
  type QuestionSummary,
} from "@/services/question-bank";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Phần đáp án của một câu hỏi, sinh LƯỜI.
 *
 * Câu chưa ai mở thì chưa có gì trong database, và bấm nút mới gọi model. Lần
 * đầu mất vài chục giây; sinh xong thì lưu vĩnh viễn nên mọi người sau đọc ngay.
 *
 * Với câu HANH_VI và DONG_CO, `canHaveSampleAnswer` là `false` và giao diện
 * KHÔNG hiện ô đáp án mẫu — chỉ hiện khung để ứng viên tự kể trải nghiệm của
 * chính họ. Đây là cùng một quy tắc mà `sampleAnswer` ở backend đang ép.
 */
export function QuestionAnswer({ question }: { question: QuestionSummary }) {
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reveal() {
    setLoading(true);
    setError(null);
    try {
      setDetail(await questionBankService.answer(question.id));
    } catch {
      setError("Chưa lấy được gợi ý trả lời. Thử lại sau ít phút.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 pt-1">
        <p className="text-xs text-slate-500">
          Đang soạn gợi ý trả lời… lần đầu có thể mất vài chục giây.
        </p>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        tone="danger"
        actions={
          <Button size="sm" variant="outline" onClick={reveal}>
            Thử lại
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button size="sm" onClick={reveal}>
          <Sparkle className="size-4" weight="fill" />
          Xem gợi ý trả lời
        </Button>
        {!question.answeredAt && (
          <span className="text-xs text-slate-500">
            Chưa ai mở câu này — gợi ý sẽ được soạn ngay bây giờ
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {detail.why && (
        <section>
          <SectionTitle label="Vì sao nhà tuyển dụng hỏi" />
          <p className="text-sm leading-relaxed">{detail.why}</p>
        </section>
      )}

      {detail.keyPoints.length > 0 && (
        <section>
          <SectionTitle label="Ý cần chạm tới" />
          <ul className="space-y-1">
            {detail.keyPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-relaxed">
                <span
                  aria-hidden
                  className="bg-primary-500 mt-2 size-1 shrink-0 rounded-full"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.answerGuide && (
        <section>
          <SectionTitle label="Hướng trả lời" />
          <p className="text-sm leading-relaxed">{detail.answerGuide}</p>
        </section>
      )}

      {detail.sampleAnswer ? (
        <section>
          <SectionTitle label="Đáp án mẫu" />
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed">
            {detail.sampleAnswer}
          </p>
        </section>
      ) : (
        <Alert tone="info" icon={Lightbulb}>
          Câu này không có đáp án mẫu, và đó là chủ đích: câu trả lời phải là
          trải nghiệm có thật của bạn. Hãy kể theo khung{" "}
          <strong>tình huống → nhiệm vụ → hành động → kết quả</strong>, và nêu
          được một con số nếu có.
        </Alert>
      )}

      {!detail.verified && (
        <Alert tone="warning">
          Gợi ý do AI soạn, chưa có người rà lại. Hãy đối chiếu với kinh nghiệm
          thật của bạn trước khi dùng.
        </Alert>
      )}
    </div>
  );
}
