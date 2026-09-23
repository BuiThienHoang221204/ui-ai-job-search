"use client";

import { useCallback, useState } from "react";
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

/**
 * Màn luyện phỏng vấn: một buổi hỏi - đáp có người phỏng vấn ảo.
 *
 * Toàn bộ phần chạy là kịch bản `.claude/commands/interview.md` chạy qua
 * `AgentRunnerService`, nên màn này KHÔNG có logic phỏng vấn nào của riêng nó —
 * nó bám theo một `AgentRun` và dựng lại buổi luyện từ nhật ký các bước.
 *
 * Buổi luyện kéo dài hàng chục phút và có thể tải lại trang giữa chừng, nên khi
 * mở màn hình việc đầu tiên là đi TÌM buổi đang dở của đúng công việc này thay
 * vì mặc định bày ra nút bắt đầu.
 */
export function useMockInterview(jobId: string) {
  const toast = useToast();
  const [startedId, setStartedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  /** Câu hỏi đang chảy về. `null` = không có lượt nào đang chạy. */
  const [streaming, setStreaming] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const loginNext = `/dashboard/interview/${jobId}/mock`;

  const job = useApiQuery(keys.jobRecord(jobId), () => jobsService.get(jobId), {
    errorMessage: "Không tải được thông tin công việc",
  });
  // Buổi ĐANG chạy do `useMockInterviewRun` bên dưới hỏi lại theo nhịp; ở đây chỉ là
  // câu hỏi "công việc này đã có buổi nào chưa", và câu đó cache được.
  const history = useApiQuery(
    keys.mockInterviewList({ jobId, workflow: WORKFLOW, limit: 1 }),
    () => mockInterviewService.list({ jobId, workflow: WORKFLOW, limit: 1 }),
    { errorMessage: "Không tải được buổi luyện đã có" },
  );

  /*
   * Buổi đang theo dõi được SUY RA, không giữ trong state riêng: buổi vừa bấm
   * bắt đầu nếu có, không thì buổi gần nhất của công việc này. Nhờ vậy tải lại
   * trang giữa chừng là quay đúng vào buổi đang dở, và không có đường nào để
   * màn hình nói khác với database.
   */
  const runId = startedId ?? history.data?.items[0]?.id ?? null;
  const { run, error, timedOut, refresh } = useMockInterviewRun(runId, loginNext);

  const send = useCallback(
    async (action: () => Promise<{ runId: string }>, fallback: string) => {
      setSending(true);
      try {
        const receipt = await action();
        setStartedId(receipt.runId);
        refresh();
        // Danh sách buổi luyện ở màn Chuẩn bị phỏng vấn vừa có thêm một dòng.
        invalidateAfter(queryClient, "mockInterview");
      } catch (err) {
        toast.danger(apiErrorMessage(err, fallback));
      } finally {
        setSending(false);
      }
    },
    [refresh, queryClient, toast],
  );

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

  /**
   * Trả lời một lượt: gửi rồi ĐỌC CHỮ CHẢY DẦN, không xếp hàng đợi.
   *
   * Đo trên một buổi thật: 18,9 giây mỗi lượt, và người dùng nhìn màn hình
   * trống suốt chừng đó vì model trả về một cục. Stream không rút ngắn 18,9
   * giây — nó biến chúng thành 3 giây rồi chữ chạy dần.
   *
   * Chỉ xoá phần chữ đang chảy SAU KHI đọc lại được bản ghi từ database: xoá
   * sớm thì câu hỏi biến mất một nhịp rồi mới hiện lại từ biên bản.
   */
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
        // Nửa câu hỏi tệ hơn không có câu nào: người dùng không biết câu hỏi đã
        // hết chưa và có thể trả lời một câu chưa hỏi xong. Xoá sạch, hiện lỗi.
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
