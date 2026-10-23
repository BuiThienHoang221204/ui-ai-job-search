"use client";

import { useMockInterview } from "@/hooks/use-mock-interview";

import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ChatsCircle,
  Sparkle,
} from "@phosphor-icons/react/ssr";

import { buildTranscript, pendingTurn } from "@/lib/interview-transcript";

import { InterviewStatusBadge } from "../../interview-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { AnswerBox } from "./answer-box";
import { InterviewAside } from "./interview-aside";
import { InterviewerAvatar } from "./interviewer-avatar";
import { InterviewTurnBlock } from "./interview-turns";
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
  } = useMockInterview(jobId, runId);

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
  const waiting = transcript ? pendingTurn(transcript) : null;
  const busy =
    sending ||
    streaming !== null ||
    run?.status === "PENDING" ||
    run?.status === "RUNNING";

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
        <SectionCard
          icon={ChatsCircle}
          title="Bắt đầu một buổi luyện"
          description="Một người phỏng vấn ảo sẽ hỏi bạn từng câu một, nghe bạn trả lời, rồi nhận xét ngay trước khi hỏi tiếp."
        >
          <EmptyState
            icon={ChatsCircle}
            title="Chưa có buổi luyện nào cho vị trí này"
            description={
              question
                ? `Người phỏng vấn ảo sẽ hỏi đúng câu bạn chọn trước: «${question}»`
                : "Buổi luyện bám theo đúng tin tuyển dụng, hồ sơ và bộ đề chuẩn bị bạn đã có, nên câu hỏi sẽ đào vào những chỗ nhà tuyển dụng nhiều khả năng đào."
            }
            action={
              <Button onClick={() => start(question)} disabled={busy}>
                <Sparkle className="size-4" />
                {busy ? "Đang chuẩn bị" : "Bắt đầu phỏng vấn thử"}
              </Button>
            }
          />
        </SectionCard>
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
                    {transcript?.turns.length
                      ? "Bám theo tin tuyển dụng và hồ sơ của bạn"
                      : "Đang soạn câu hỏi đầu tiên"}
                  </p>
                </div>
              </div>
              <InterviewStatusBadge status={run.status} />
            </header>

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
                <Button
                  variant="outline"
                  onClick={() => start()}
                  disabled={busy}
                >
                  <ArrowCounterClockwise className="size-4" />
                  Luyện lại từ đầu
                </Button>
              )}
            </div>

            {waiting && !busy && (
              <AnswerBox sending={sending} onSend={answer} />
            )}
          </section>

          <InterviewAside jobId={jobId} transcript={transcript} />
        </div>
      )}
    </div>
  );
}
