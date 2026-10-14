"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ChatsCircle,
  Eye,
  EyeSlash,
  PencilSimpleLine,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import {
  interviewService,
  type AnswerKind,
  type PrepAnswer,
} from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { usePrepCache } from "@/hooks/use-interview-prep";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AUTOSAVE_MS = 1200;
const FEEDBACK_MIN = 20;

/** Một câu luyện tập: tự trả lời trước (tự lưu), xin nhận xét, rồi mới mở gợi ý. */
export function PracticeQuestion({
  jobId,
  kind,
  index,
  question,
  answer,
  meta,
  subtitle,
  hint,
}: {
  jobId: string;
  kind: AnswerKind;
  index: number;
  question: string;
  answer: PrepAnswer | null;
  meta?: ReactNode;
  subtitle?: string | null;
  hint: ReactNode;
}) {
  const toast = useToast();
  const { putAnswer } = usePrepCache(jobId);
  const [answering, setAnswering] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [draft, setDraft] = useState(answer?.text ?? "");
  const [savedText, setSavedText] = useState(answer?.text ?? "");
  const [saving, setSaving] = useState(false);
  const [judging, setJudging] = useState(false);

  const persist = useCallback(
    (text: string) => {
      setSaving(true);
      interviewService
        .saveAnswer(jobId, kind, index, text)
        .then((result) => {
          setSavedText(text);
          putAnswer(kind, index, result.answer);
        })
        .catch((cause: unknown) =>
          toast.danger(apiErrorMessage(cause, "Không lưu được câu trả lời")),
        )
        .finally(() => setSaving(false));
    },
    [jobId, kind, index, putAnswer, toast],
  );

  const dirty = draft.trim() !== savedText.trim();

  useEffect(() => {
    if (!answering || judging || !dirty) return;
    const timer = setTimeout(() => persist(draft), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [answering, judging, dirty, draft, persist]);

  const toggleAnswer = () => {
    if (answering && dirty && !judging) persist(draft);
    setAnswering((open) => !open);
  };

  const askFeedback = async () => {
    setJudging(true);
    try {
      const result = await interviewService.feedback(jobId, kind, index, draft);
      setSavedText(draft);
      putAnswer(kind, index, result.answer);
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, "Không nhận xét được câu trả lời"));
    } finally {
      setJudging(false);
    }
  };

  const feedback = answer?.feedback ?? null;
  const feedbackStale =
    feedback !== null &&
    (answer?.feedbackStale === true || draft.trim() !== answer?.text);
  const tooShort = draft.trim().length < FEEDBACK_MIN;
  const status = saving ? "Đang lưu…" : draft.trim() && !dirty ? "Đã lưu" : null;

  return (
    <article className="rounded-xl border border-slate-200/80 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 empty:hidden">
        {meta}
        {answer && <Badge variant="success">Đã tự trả lời</Badge>}
      </div>
      <h3 className="text-sm font-semibold leading-relaxed text-slate-900">
        {question}
      </h3>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={answering ? "outline" : "primary"}
          onClick={toggleAnswer}
        >
          <PencilSimpleLine className="size-4" />
          {answering ? "Đóng" : answer ? "Sửa câu trả lời" : "Tự trả lời"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setHintOpen((open) => !open)}
        >
          {hintOpen ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
          {hintOpen ? "Ẩn gợi ý" : "Xem gợi ý"}
        </Button>
        <Link
          href={`/dashboard/interview/${jobId}/mock?q=${encodeURIComponent(question)}`}
        >
          <Button size="sm" variant="ghost" title="Mở phỏng vấn thử, bắt đầu từ câu này">
            <ChatsCircle className="size-4" />
            Luyện câu này
          </Button>
        </Link>
      </div>

      {answering && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={4000}
            rows={5}
            placeholder="Trả lời như đang nói với người phỏng vấn…"
            aria-label={`Câu trả lời cho: ${question}`}
            className="block w-full resize-y rounded-t-lg border-0 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2">
            <p className="flex-1 text-xs text-slate-500">
              {status ??
                (kind === "STAR"
                  ? "Nhận xét theo khung STAR, so với hồ sơ và tin tuyển dụng"
                  : "Nhận xét cách bạn thừa nhận và bắc cầu sang kinh nghiệm thật")}
            </p>
            <Button
              size="sm"
              onClick={() => void askFeedback()}
              loading={judging}
              disabled={tooShort || judging}
              title={tooShort ? `Viết ít nhất ${FEEDBACK_MIN} ký tự để nhận xét` : undefined}
            >
              {!judging && <Sparkle className="size-4" />}
              {judging ? "Đang nhận xét…" : "Nhận xét"}
            </Button>
          </div>

          {feedback && (
            <div className="border-t border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
              {feedbackStale && (
                <p className="mb-1.5 text-xs text-amber-700">
                  Nhận xét này cho bản trước khi bạn sửa. Bấm Nhận xét để chấm lại.
                </p>
              )}
              <p className="font-medium text-slate-900">{feedback.summary}</p>
              {feedback.improvements.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {feedback.improvements.map((item, position) => (
                    <li key={position} className="flex gap-2 leading-relaxed">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {hintOpen && (
        <div className="mt-3 rounded-lg bg-primary-50/50 px-3 py-3">{hint}</div>
      )}
    </article>
  );
}
