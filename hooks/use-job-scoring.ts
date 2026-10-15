"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { JobMatchDetail, PartialEvaluation } from "@/types";
import { matchesService } from "@/services";
import { apiErrorStatus } from "@/lib/axios";
import {
  MatchServerError,
  MatchStreamError,
  streamMatchEvaluation,
} from "@/lib/match-stream";
import { invalidateAfter } from "@/lib/query-keys";
import { updateJobDetail } from "@/lib/job-cache";

const SCORE_POLL_MS = 2_500;
const SCORE_TIMEOUT_MS = 180_000;

/** Chấm điểm một tin bằng stream, rơi về hàng đợi khi stream hỏng; kết quả ghi thẳng vào cache của `useJobDetail`. */
export function useJobScoring(jobId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scoring, setScoring] = useState(false);
  const [partial, setPartial] = useState<PartialEvaluation | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const applyMatch = (match: JobMatchDetail) => {
    updateJobDetail(queryClient, jobId, (data) => ({ ...data, match }));
    invalidateAfter(queryClient, "scoreJob");
  };
  const toLogin = () => router.replace(`/login?next=/dashboard/jobs/${jobId}`);

  const scoreByQueue = async (force: boolean) => {
    await matchesService.evaluate(jobId, force);
    const started = Date.now();
    while (mounted.current && Date.now() - started < SCORE_TIMEOUT_MS) {
      await new Promise((done) => setTimeout(done, SCORE_POLL_MS));
      const next = await matchesService.get(jobId).catch(() => null);
      if (next && next.status !== "PENDING" && next.status !== "RUNNING") {
        applyMatch(next);
        return;
      }
    }
  };

  const score = (force: boolean) => {
    setScoring(true);
    setPartial(null);
    void (async () => {
      try {
        const match = await streamMatchEvaluation({
          jobId,
          force,
          onPartial: setPartial,
        });
        applyMatch(match);
      } catch (err) {
        if (apiErrorStatus(err) === 401) return toLogin();
        try {
          // Server đã báo lỗi AI thì bản ghi đã là FAILED: chỉ đọc lại, xếp hàng nữa là chạy lại nguyên chuỗi model.
          if (err instanceof MatchServerError) {
            const next = await matchesService.get(jobId);
            if (next) applyMatch(next);
          } else {
            await scoreByQueue(force);
          }
        } catch (fallbackError) {
          if (apiErrorStatus(fallbackError) === 401) toLogin();
        }
        if (!(err instanceof MatchStreamError)) throw err;
      } finally {
        setScoring(false);
        setPartial(null);
      }
    })();
  };

  return { scoring, partial, score };
}
