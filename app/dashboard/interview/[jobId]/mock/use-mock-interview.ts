"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/axios";
import { mockInterviewService, jobsService } from "@/services";
import { useMockInterviewRun } from "@/hooks/use-mock-interview-run";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
import { useToast } from "@/components/ui/toast";
import {
  InterviewStreamError,
  streamInterviewOpen,
  streamInterviewTurn,
} from "@/lib/interview-stream";

const WORKFLOW = "interview";

/** Lượt chạy đã dừng hẳn, không còn chờ gì. */
export const isClosed = (status: string) => status === "DONE" || status === "FAILED";

/** Hook buổi luyện phỏng vấn: tìm buổi đang dở, bắt đầu buổi mới và gửi câu trả lời. */
export function useMockInterview(jobId: string) {
  const toast = useToast();
  const [startedId, setStartedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const loginNext = `/dashboard/interview/${jobId}/mock`;

  const job = useApiQuery(keys.jobRecord(jobId), () => jobsService.get(jobId), {
    errorMessage: "Không tải được thông tin công việc",
  });
  const history = useApiQuery(
    keys.mockInterviewList({ jobId, workflow: WORKFLOW, limit: 1 }),
    () => mockInterviewService.list({ jobId, workflow: WORKFLOW, limit: 1 }),
    { errorMessage: "Không tải được buổi luyện đã có" },
  );

  const runId = startedId ?? history.data?.items[0]?.id ?? null;
  const { run, error, timedOut, refresh } = useMockInterviewRun(runId, loginNext);

  const start = () => {
    setSending(true);
    setStreaming("");
    void streamInterviewOpen({
      jobId,
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

  /** Gửi câu trả lời rồi đọc câu hỏi tiếp theo chảy dần từ stream. */
  const answer = (text: string) => {
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
      })
      .catch((cause: unknown) => {
        setStreaming(null);
        toast.danger(
          cause instanceof InterviewStreamError
            ? `${cause.message} Câu trả lời của bạn chưa được ghi nhận, gửi lại giúp nhé.`
            : apiErrorMessage(cause, "Không gửi được câu trả lời"),
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
    answer,
  };
}
