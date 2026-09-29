"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";

type Loader<T> = () => Promise<T>;

export interface AsyncData<T> {
  data: T | null;
  error: string | null;
  errorStatus: number | null;
  loading: boolean;
  reload: () => void;
}

/** Tải dữ liệu cho một màn hình, suy ra cờ loading thay vì lưu thành state. */
export function useAsyncData<T>(
  load: Loader<T> | null,
  options: { loginNext: string; errorMessage: string },
): AsyncData<T> {
  const router = useRouter();
  const { loginNext, errorMessage } = options;

  const [result, setResult] = useState<{
    loadedFor: Loader<T> | null;
    data: T | null;
    error: string | null;
    errorStatus: number | null;
  }>({ loadedFor: null, data: null, error: null, errorStatus: null });

  useEffect(() => {
    if (!load) return;
    if (result.loadedFor === load) return;

    let alive = true;

    void (async () => {
      try {
        const data = await load();
        if (alive) {
          setResult({ loadedFor: load, data, error: null, errorStatus: null });
        }
      } catch (err) {
        if (!alive) return;
        const status = apiErrorStatus(err);
        if (status === 401) {
          router.replace(`/login?next=${loginNext}`);
          return;
        }
        setResult({
          errorStatus: status ?? null,
          loadedFor: load,
          data: null,
          error: apiErrorMessage(err, errorMessage),
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [load, result.loadedFor, router, loginNext, errorMessage]);

  /** Tải lại cùng request bằng cách xoá dấu `loadedFor`. */
  const reload = useCallback(
    () => setResult((current) => ({ ...current, loadedFor: null })),
    [],
  );

  return {
    data: result.data,
    error: result.error,
    errorStatus: result.errorStatus,
    loading: load !== null && result.loadedFor !== load,
    reload,
  };
}
