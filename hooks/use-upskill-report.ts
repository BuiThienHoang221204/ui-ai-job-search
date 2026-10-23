"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ModelServerError, streamModel } from "@/lib/model-stream";
import { failureMessage } from "@/lib/failure-message";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { upskillService } from "@/services";
import type { UpskillReportRecord } from "@/types";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 80;

interface UpskillPartial {
  step?: number;
}

const finished = (report: UpskillReportRecord | undefined) =>
  report?.status === "DONE" || report?.status === "FAILED";

/** Báo cáo AI (khoảng trống mềm): đọc bản mới nhất, tạo lại bằng stream, có lượt đang chạy (vào lại trang hoặc đứt stream) thì hỏi lại tới khi xong. */
export function useUpskillReport() {
  const queryClient = useQueryClient();
  const [streaming, setStreaming] = useState(false);
  const [streamStep, setStreamStep] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(null);

  const latest = useApiQuery(
    keys.upskill(),
    () =>
      upskillService.latest().catch((err: unknown) => {
        if (apiErrorStatus(err) === 404) return null;
        throw err;
      }),
    { errorMessage: "Không tải được báo cáo" },
  );

  const inFlight = useQuery({
    queryKey: keys.upskillInFlight(),
    queryFn: () => upskillService.inFlight(),
  });
  const running = inFlight.data ?? null;

  const progress = useQuery({
    queryKey: keys.upskillRun(running?.id ?? null),
    queryFn: async () => {
      const current = await upskillService.get(running!.id);
      if (finished(current)) {
        queryClient.setQueryData(keys.upskill(), current);
        queryClient.setQueryData(keys.upskillInFlight(), null);
      }
      return current;
    },
    enabled: running !== null,
    refetchInterval: (query) =>
      finished(query.state.data) || query.state.dataUpdateCount >= MAX_POLLS
        ? false
        : POLL_INTERVAL_MS,
  });

  const polls = queryClient.getQueryState(keys.upskillRun(running?.id ?? null))?.dataUpdateCount ?? 0;
  const polling =
    running !== null && !finished(progress.data) && !progress.isError && polls < MAX_POLLS;

  const generate = async () => {
    setStreaming(true);
    setStreamError(null);
    setStreamStep(0);
    try {
      const done = await streamModel<UpskillReportRecord, UpskillPartial>({
        path: "/upskill/generate-stream",
        onPartial: (partial) => {
          if (typeof partial.step === "number") setStreamStep(partial.step);
        },
      });
      queryClient.setQueryData(keys.upskill(), done);
    } catch (err) {
      if (err instanceof ModelServerError) {
        setStreamError(err.message);
      } else {
        const resumed = await queryClient.fetchQuery({
          queryKey: keys.upskillInFlight(),
          queryFn: () => upskillService.inFlight(),
          staleTime: 0,
        });
        if (!resumed) setStreamError("Mất kết nối trước khi phân tích bắt đầu. Hãy thử lại.");
      }
    } finally {
      setStreaming(false);
    }
  };

  let error = streamError ?? latest.error;
  if (progress.isError) error = apiErrorMessage(progress.error, "Không đọc được trạng thái phân tích");
  if (running && polls >= MAX_POLLS && !finished(progress.data)) {
    error = "Phân tích chạy quá lâu. Tải lại trang sau ít phút để xem kết quả.";
  }
  if (latest.data?.status === "FAILED") error = failureMessage(latest.data.failureKind);

  let step = streamStep;
  let since: number | undefined;
  if (!streaming && running && streamStep === 0) {
    step = running.jobsAnalysed > 0 ? 2 : 1;
    since = Date.parse(running.createdAt);
  }

  return {
    report: latest.data ?? null,
    loaded: latest.data !== null || !latest.loading,
    error,
    generating: streaming || polling,
    step,
    since,
    generate,
  };
}
