"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ModelServerError, streamModel } from "@/lib/model-stream";
import { failureMessage } from "@/lib/failure-message";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { upskillService } from "@/services";
import type { UpskillReportRecord } from "@/types";

const LOGIN_NEXT = "/login?next=/dashboard/upskill";
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 80;

interface UpskillPartial {
  step?: number;
}

/** Báo cáo AI (khoảng trống mềm): đọc bản mới nhất, tạo lại bằng stream, đứt stream thì nối lại báo cáo đang chạy rồi hỏi lại tới khi xong. */
export function useUpskillReport() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [since, setSince] = useState<number | undefined>();

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const query = useApiQuery(
    keys.upskill(),
    () =>
      upskillService.latest().catch((err: unknown) => {
        if (apiErrorStatus(err) === 404) return null;
        throw err;
      }),
    { errorMessage: "Không tải được báo cáo" },
  );

  const putReport = useCallback(
    (next: UpskillReportRecord) => queryClient.setQueryData(keys.upskill(), next),
    [queryClient],
  );

  const fail = (err: unknown, fallback: string) => {
    setGenerating(false);
    if (apiErrorStatus(err) === 401) {
      router.replace(LOGIN_NEXT);
      return;
    }
    setError(apiErrorMessage(err, fallback));
  };

  const poll = (reportId: string, polls: number) => {
    if (!mounted.current) return;
    upskillService
      .get(reportId)
      .then((current) => {
        if (!mounted.current) return;
        if (current.status === "DONE" || current.status === "FAILED") {
          putReport(current);
          setGenerating(false);
          if (current.status === "FAILED") setError(failureMessage(current.failureKind));
          return;
        }
        if (polls + 1 >= MAX_POLLS) {
          setGenerating(false);
          setError("Phân tích chạy quá lâu. Tải lại trang sau ít phút để xem kết quả.");
          return;
        }
        setTimeout(() => poll(reportId, polls + 1), POLL_INTERVAL_MS);
      })
      .catch((err: unknown) => {
        if (mounted.current) fail(err, "Không đọc được trạng thái phân tích");
      });
  };

  useEffect(() => {
    upskillService
      .inFlight()
      .then((running) => {
        if (!running || !mounted.current) return;
        setGenerating(true);
        setSince(Date.parse(running.createdAt));
        setStep(running.jobsAnalysed > 0 ? 2 : 1);
        poll(running.id, 0);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setStep(0);
    setSince(undefined);

    let streamError: unknown;
    try {
      const done = await streamModel<UpskillReportRecord, UpskillPartial>({
        path: "/upskill/generate-stream",
        onPartial: (partial) => {
          if (mounted.current && typeof partial.step === "number") setStep(partial.step);
        },
      });
      if (!mounted.current) return;
      putReport(done);
      setGenerating(false);
      return;
    } catch (err) {
      streamError = err;
    }
    if (!mounted.current) return;

    if (streamError instanceof ModelServerError) {
      setGenerating(false);
      setError(streamError.message);
      return;
    }

    try {
      const running = await upskillService.inFlight();
      if (running) {
        poll(running.id, 0);
        return;
      }
      setGenerating(false);
      setError("Mất kết nối trước khi phân tích bắt đầu. Hãy thử lại.");
    } catch (err) {
      fail(err, "Không đọc được trạng thái phân tích");
    }
  };

  return {
    report: query.data ?? null,
    loaded: query.data !== null || !query.loading,
    error: error ?? query.error,
    generating,
    step,
    since,
    generate,
  };
}
