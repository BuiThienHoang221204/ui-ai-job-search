"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { mockInterviewService, type MockInterviewRecord } from "@/services";

const POLL_INTERVAL_MS = 2000;

const MAX_POLLS = 330;

export interface AgentRunView {
  run: MockInterviewRecord | null;
  error: string | null;
  timedOut: boolean;
  refresh: () => void;
}

/** Lượt chạy còn đang chạy hay đã dừng hẳn. */
const isRunning = (run: MockInterviewRecord | null): boolean =>
  run?.status === "PENDING" || run?.status === "RUNNING";

/** Bám theo một lượt chạy agent phỏng vấn thử cho tới khi nó dừng. */
export function useMockInterviewRun(
  runId: string | null,
  loginNext: string,
): AgentRunView {
  const router = useRouter();
  const [run, setRun] = useState<MockInterviewRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const watching = useRef<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    if (watching.current !== runId) {
      watching.current = runId;
      setRun(null);
      setError(null);
      setTimedOut(false);
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let polls = 0;

    const read = async () => {
      try {
        const record = await mockInterviewService.get(runId);
        if (cancelled) return;

        setRun(record);
        if (!isRunning(record)) return;

        polls += 1;
        if (polls >= MAX_POLLS) {
          setTimedOut(true);
          return;
        }
        timer = setTimeout(() => void read(), POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setError(apiErrorMessage(err, "Không đọc được lượt chạy"));
      }
    };

    void read();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [runId, attempt, router, loginNext]);

  const refresh = useCallback(() => setAttempt((count) => count + 1), []);

  return { run, error, timedOut, refresh };
}
