"use client";

import { useEffect, useState } from "react";

/** Số giây kể từ `since` (mốc epoch ms), mặc định từ khi component gắn vào. */
export function useElapsedSeconds(since?: number): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const startedAt = since ?? Date.now();
    const timer = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [since]);

  return seconds;
}
