"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/axios";
import { mockInterviewService } from "@/services";
import { useMockInterviewRun } from "@/hooks/use-mock-interview-run";
import { useApiQuery } from "@/hooks/use-api-query";
import { useJobDetail } from "@/hooks/use-job-detail";
import { invalidateAfter, keys } from "@/lib/query-keys";
import {
  InterviewServerError,
  InterviewStreamError,
  streamInterviewOpen,
  streamInterviewTurn,
} from "@/lib/interview-stream";
import { useToast } from "@/hooks/use-toast";

const WORKFLOW = "interview";

/** Hook buổi luyện phỏng vấn: mở buổi được chọn (hoặc buổi gần nhất), bắt đầu buổi mới và gửi câu trả lời. */
export function useMockInterview(jobId: string, chosenRunId?: string) {
  const toast = useToast();
  const [startedId, setStartedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const loginNext = `/dashboard/interview/${jobId}/mock`;

  const job = useJobDetail(jobId);
  const history = useApiQuery(
    keys.mockInterviewList({ jobId, workflow: WORKFLOW, limit: 1 }),
    () => mockInterviewService.list({ jobId, workflow: WORKFLOW, limit: 1 }),
    { errorMessage: "Không tải được buổi luyện đã có" },
  );

  const runId =
    startedId ?? chosenRunId ?? history.data?.items[0]?.id ?? null;
  const { run, error, timedOut, refresh } = useMockInterviewRun(
    runId,
    loginNext,
  );

  /** Mở buổi mới; có `question` thì người phỏng vấn ảo hỏi đúng câu đó trước. */
  const start = (question?: string) => {
    setSending(true);
    setStreaming("");
    void streamInterviewOpen({
      jobId,
      question,
      onText: setStreaming,
      onRunId: setStartedId,
    })
      .then(() => {
        refresh();
        setStreaming(null);
        invalidateAfter(queryClient, "mockInterview");
      })
      .catch((cause: unknown) => {
        setStreaming(null);
        toast.danger(
          cause instanceof InterviewStreamError
            ? cause.message
            : apiErrorMessage(cause, "Không bắt đầu được buổi luyện"),
        );
      })
      .finally(() => setSending(false));
  };

  /** Gửi câu trả lời (hoặc `null` để kết thúc sớm) rồi đọc lượt tiếp theo chảy dần từ stream. */
  const send = (text: string | null) => {
    setSending(true);
    setStreaming("");

    void streamInterviewTurn({
      runId: runId!,
      answer: text,
      onText: setStreaming,
    })
      .then(() => {
        refresh();
        setStreaming(null);
        invalidateAfter(queryClient, "mockInterview");
      })
      .catch((cause: unknown) => {
        setStreaming(null);
        if (!(cause instanceof InterviewStreamError)) {
          toast.danger(
            apiErrorMessage(
              cause,
              text === null
                ? "Không kết thúc được buổi luyện"
                : "Không gửi được câu trả lời",
            ),
          );
          return;
        }
        if (text === null || cause instanceof InterviewServerError) {
          toast.danger(cause.message);
          return;
        }
        toast.danger(
          `${cause.message} Câu trả lời của bạn chưa được ghi nhận, gửi lại giúp nhé.`,
        );
      })
      .finally(() => setSending(false));
  };

  return {
    job,
    history,
    run,
    error,
    timedOut,
    refresh,
    sending,
    streaming,
    start,
    answer: (text: string) => send(text),
    finish: () => send(null),
  };
}
