"use client";

import { useCallback, useEffect, useState } from "react";

const COPIED_RESET_MS = 2000;

export interface Copier {
  copied: string | null;
  copy: (key: string, value: string | null) => void;
}

/** Sao chép vào clipboard kèm nhãn "đã sao chép" tự tắt sau một lúc. */
export function useCopy(): Copier {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = useCallback((key: string, value: string | null) => {
    if (!value || !navigator.clipboard) return;
    void navigator.clipboard.writeText(value).then(() => setCopied(key));
  }, []);

  return { copied, copy };
}
