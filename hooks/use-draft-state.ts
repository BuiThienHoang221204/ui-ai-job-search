"use client";

import { useCallback, useState } from "react";

/** Ô nhập giữ nội dung qua đổi tab và tải lại trang nhờ sessionStorage. */
export function useDraftState(
  key: string,
  initial = "",
): [string, (next: string) => void] {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return initial;
    try {
      return window.sessionStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: string) => {
      setValue(next);
      try {
        window.sessionStorage.setItem(key, next);
      } catch {}
    },
    [key],
  );

  return [value, update];
}
