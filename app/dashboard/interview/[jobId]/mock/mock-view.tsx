"use client";

import { useState } from "react";
import { useMockInterview } from "@/hooks/use-mock-interview";
import { useVoiceInterview } from "@/hooks/use-voice-interview";
import { useFollowLatest } from "@/hooks/use-follow-latest";

import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ChatsCircle,
  Microphone,
  Sparkle,
  StopCircle,
} from "@phosphor-icons/react/ssr";

import { buildTranscript, pendingTurn } from "@/lib/interview-transcript";

import { InterviewStatusBadge } from "../../interview-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Modal } from "@/components/ui/modal";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { AnswerBox } from "./answer-box";
import { InterviewAside } from "./interview-aside";
import { InterviewerAvatar } from "./interviewer-avatar";
import { InterviewTurnBlock } from "./interview-turns";
import { ModeChoice } from "./mode-choice";
import { VoiceDropped } from "./voice/voice-dropped";
import { VoiceHeader } from "./voice/voice-header";
import { VoiceProblemModal } from "./voice/voice-problem-modal";
import { VoiceStage } from "./voice/voice-stage";
import { failureMessage } from "@/lib/failure-message";
import { isClosed } from "@/lib/interview-status";

/** Màn luyện phỏng vấn thử: biên bản các lượt, câu đang chảy về và ô trả lời. */
export function MockInterviewView({
  jobId,
  question,
  runId,
}: {
  jobId: string;
  question?: string;
  runId?: string;
}) {
  const {
    job,
    history,
    run,
    error,
    timedOut,
    refresh,
    sending,
    streaming,
    start,
    answer,
    finish,
    adopt,
  } = useMockInterview(jobId, runId);
  const voice = useVoiceInterview(jobId, {
    onRun: adopt,
    onSaved: refresh,
    onEnded: finish,
  });
  const { anchor, follow } = useFollowLatest(streaming ?? run);
  const [confirmFinish, setConfirmFinish] = useState(false);

  if (job.error)
    return <PageError title="Không tải được dữ liệu" message={job.error} />;
  if (!job.data || !history.data)
    return (
      <SkeletonPage>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </SkeletonPage>
    );

  const transcript = run ? buildTranscript(run) : null;
  const waiting =
    run && transcript && !isClosed(run.status) ? pendingTurn(transcript) : null;
  const busy =
    sending ||
    streaming !== null ||
    run?.status === "PENDING" ||
    run?.status === "RUNNING";
  const live = voice.status !== "idle";
  const spoken = run?.input?.mode === "voice";
  const answered =
    transcript?.turns.filter((turn) => turn.answer !== null).length ?? 0;
  const dropped =
    spoken &&
    run.status === "WAITING_USER" &&
    !live &&
    !busy &&
    !voice.problem;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phỏng vấn thử"
        subtitle={`${job.data.job.title} · ${job.data.job.company}`}
        actions={
          <Link href={`/dashboard/interview?job=${jobId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" />
              Bộ câu hỏi
            </Button>
          </Link>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {question && run && (
        <Alert
          tone="info"
          title="Luyện câu bạn chọn"
          actions={
            <Button size="sm" onClick={() => start(question)} disabled={busy}>
              <Sparkle className="size-4" />
              Bắt đầu buổi mới từ câu này
            </Button>
          }
        >
          «{question}»
        </Alert>
      )}

      {run?.status === "FAILED" && (
        <Alert tone="danger" title="Buổi luyện dừng giữa chừng">
          {failureMessage(run.failureKind)}
        </Alert>
      )}

      {timedOut && (
        <Alert
          tone="warning"
          title="Chờ quá lâu"
          actions={
            <Button variant="outline" size="sm" onClick={refresh}>
              <ArrowCounterClockwise className="size-4" />
              Đọc lại trạng thái
            </Button>
          }
        >
          Người phỏng vấn ảo chưa soạn xong câu tiếp theo. Hàng đợi có thể đang
          kẹt.
        </Alert>
      )}

      {!run ? (
        <ModeChoice
          busy={busy || live}
          question={question}
          onText={() => start(question)}
          onVoice={voice.start}
        />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18.75rem]">
          <section className="rounded-2xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <InterviewerAvatar />
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">
                    Người phỏng vấn ảo
                  </p>
                  <p className="text-[13px] text-slate-500">
                    {spoken
                      ? "Buổi luyện bằng giọng nói"
                      : "Bám theo tin tuyển dụng và hồ sơ của bạn"}
                  </p>
                </div>
              </div>
              {live ? (
                <VoiceHeader voice={voice} />
              ) : (
                <div className="flex items-center gap-2">
                  {dropped && (
                    <span className="inline-flex h-6.5 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 text-[12.5px] font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset before:size-1.75 before:rounded-full before:bg-current">
                      Mất kết nối
                    </span>
                  )}
                  {!dropped && <InterviewStatusBadge status={run.status} />}
                  {waiting && !busy && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmFinish(true)}
                    >
                      <StopCircle className="size-4" />
                      Kết thúc buổi luyện
                    </Button>
                  )}
                </div>
              )}
            </header>

            {live && <VoiceStage voice={voice} />}
            {dropped && (
              <VoiceDropped
                answered={answered}
                onFinish={() => {
                  follow();
                  finish();
                }}
                onRestart={voice.start}
              />
            )}

            <div className="space-y-5 px-5 pt-5 pb-4">
              {transcript?.intro && (
                <Markdown text={transcript.intro} className="text-slate-600" />
              )}

              {transcript?.turns.length ? (
                <ol className="space-y-5">
                  {transcript.turns.map((turn) => (
                    <InterviewTurnBlock
                      key={turn.index}
                      turn={turn}
                      waiting={waiting?.index === turn.index}
                      spoken={spoken}
                    />
                  ))}
                </ol>
              ) : null}

              {streaming !== null && (
                <div className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3">
                  <InterviewerAvatar />
                  {streaming ? (
                    <Markdown
                      text={streaming}
                      className="text-base text-slate-800"
                    />
                  ) : (
                    <span
                      className="flex w-max gap-1 rounded-2xl bg-slate-100 px-3.5 py-3"
                      aria-label="Người phỏng vấn đang nghĩ"
                    >
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              )}

              {busy && streaming === null && (
                <p className="text-sm text-slate-500">
                  Người phỏng vấn ảo đang đọc câu trả lời của bạn…
                </p>
              )}

              {transcript?.closing && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-800">
                    Tổng kết buổi luyện
                  </p>
                  <Markdown
                    text={transcript.closing}
                    className="mt-1 text-[15px]"
                  />
                </div>
              )}

              {isClosed(run.status) && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={voice.start}
                    disabled={busy || live}
                  >
                    <Microphone className="size-4" />
                    Luyện lại bằng giọng nói
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => start()}
                    disabled={busy || live}
                  >
                    <ChatsCircle className="size-4" />
                    Luyện lại bằng chữ
                  </Button>
                </div>
              )}

              <div ref={anchor} className="scroll-mb-32" />
            </div>

            {waiting && !busy && (
              <AnswerBox
                sending={sending}
                onSend={(text) => {
                  follow();
                  answer(text);
                }}
              />
            )}
          </section>

          <InterviewAside
            jobId={jobId}
            transcript={transcript}
            spoken={spoken || live}
          />
        </div>
      )}

      <VoiceProblemModal voice={voice} onText={() => start(question)} />

      <Modal
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        title="Kết thúc buổi luyện?"
      >
        <p className="text-sm text-slate-600">
          Bạn sẽ nhận lời tổng kết cho{" "}
          {answered}{" "}
          câu đã trả lời. Câu đang hỏi sẽ được bỏ qua, và không thể tiếp tục
          buổi này nữa.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmFinish(false)}>
            Tiếp tục luyện
          </Button>
          <Button
            onClick={() => {
              setConfirmFinish(false);
              follow();
              finish();
            }}
          >
            Kết thúc và xem tổng kết
          </Button>
        </div>
      </Modal>
    </div>
  );
}
