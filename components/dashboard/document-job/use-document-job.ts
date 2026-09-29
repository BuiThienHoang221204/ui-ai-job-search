"use client";

import type { PartialCv } from "@/lib/cv-partial";
import { ModelStreamError, streamModel } from "@/lib/model-stream";
import type { DocumentJob, DocumentJobPhase } from "./document-job.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { invalidateAfter } from "@/lib/query-keys";
import {
  documentsService,
  type DocumentRecord,
  type QueuedDocument,
} from "@/services";
import { failureMessage } from "@/lib/failure-message";

const POLL_INTERVAL_MS = 2000;

const MAX_POLLS = 80;

type Watch =
  | { kind: "starting" }
  | { kind: "watching"; documentId: string };

interface Progress {
  of: Watch | null;
  document: DocumentRecord | null;
  error: string | null;
  timedOut: boolean;
  partial: PartialCv | null;
}

const NOTHING: Progress = {
  of: null,
  document: null,
  error: null,
  timedOut: false,
  partial: null,
};

/** Bám theo một tài liệu chạy nền: gọi đường ghi rồi hỏi lại đường đọc tới khi xong. */
export function useDocumentJob(loginNext: string): DocumentJob {
  const router = useRouter();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [progress, setProgress] = useState<Progress>(NOTHING);

  const queryClient = useQueryClient();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const current = progress.of === watch ? progress : NOTHING;

  useEffect(() => {
    if (watch?.kind !== "watching") return;

    const { documentId } = watch;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let polls = 0;

    const read = async () => {
      try {
        const record = await documentsService.get(documentId);
        if (cancelled) return;

        if (record.status === "DONE") {
          setProgress({ ...NOTHING, of: watch, document: record });
          invalidateAfter(queryClient, "createDocument");
          return;
        }
        if (record.status === "FAILED") {
          setProgress({
            ...NOTHING,
            of: watch,
            document: record,
            error: failureMessage(record.failureKind),
          });
          return;
        }

        polls += 1;
        if (polls >= MAX_POLLS) {
          setProgress({
            ...NOTHING,
            of: watch,
            document: record,
            timedOut: true,
          });
          return;
        }

        setProgress({ ...NOTHING, of: watch, document: record });
        timer = setTimeout(() => {
          void read();
        }, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setProgress({
          ...NOTHING,
          of: watch,
          error: apiErrorMessage(err, "Không đọc được trạng thái tài liệu"),
        });
      }
    };

    void read();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [watch, router, loginNext, queryClient]);

  const start = useCallback(
    (create: () => Promise<QueuedDocument>) => {
      const opened: Watch = { kind: "starting" };
      setWatch(opened);

      void (async () => {
        try {
          const receipt = await create();
          if (!mounted.current) return;
          setWatch({ kind: "watching", documentId: receipt.documentId });
        } catch (err) {
          if (!mounted.current) return;
          if (apiErrorStatus(err) === 401) {
            router.replace(`/login?next=${loginNext}`);
            return;
          }
          setProgress({
            ...NOTHING,
            of: opened,
            error: apiErrorMessage(err, "Không gửi được yêu cầu tạo tài liệu"),
          });
        }
      })();
    },
    [router, loginNext],
  );

  const startStream = useCallback(
    (create: () => Promise<QueuedDocument>) => {
      const opened: Watch = { kind: "starting" };
      setWatch(opened);
      setProgress({ ...NOTHING, of: opened });

      void (async () => {
        try {
          const receipt = await create();
          if (!mounted.current) return;

          const document = await streamModel<DocumentRecord, PartialCv>({
            path: `/documents/${receipt.documentId}/generate-stream`,
            onPartial: (partial) => {
              if (mounted.current)
                setProgress((now) => ({ ...now, of: opened, partial }));
            },
          });
          if (!mounted.current) return;
          setProgress({ ...NOTHING, of: opened, document });
          invalidateAfter(queryClient, "createDocument");
        } catch (err) {
          if (!mounted.current) return;
          if (apiErrorStatus(err) === 401) {
            router.replace(`/login?next=${loginNext}`);
            return;
          }
          setProgress({
            ...NOTHING,
            of: opened,
            error:
              err instanceof ModelStreamError
                ? err.message
                : apiErrorMessage(err, "Không tạo được tài liệu"),
          });
        }
      })();
    },
    [router, loginNext, queryClient],
  );

  const open = useCallback((documentId: string) => {
    setWatch({ kind: "watching", documentId });
  }, []);

  const recheck = useCallback(() => {
    setWatch((now) =>
      now?.kind === "watching" ? { ...now } : now,
    );
  }, []);

  const phase: DocumentJobPhase = !watch
    ? "idle"
    : current.error
      ? "failed"
      : current.timedOut
        ? "timeout"
        : current.document?.status === "DONE"
          ? "done"
          : "generating";

  return {
    phase,
    document: current.document,
    error: current.error,
    partial: current.partial,
    start,
    startStream,
    open,
    recheck,
  };
}
