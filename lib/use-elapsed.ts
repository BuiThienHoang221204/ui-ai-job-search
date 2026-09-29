"use client";

import { useEffect, useState } from "react";

/** Số giây kể từ khi component gắn vào. */
export function useElapsedSeconds(): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return seconds;
}

/** Phần trăm tiến trình giả lập, không bao giờ chạm 100 khi chưa xong. */
export function progressFor(elapsed: number, expected: number): number {
  if (elapsed <= 0) return 0;
  if (elapsed < expected) return Math.round((elapsed / expected) * 85);
  const over = elapsed - expected;
  return Math.min(95, 85 + Math.round((over / (over + expected)) * 10));
}

/** Định dạng số giây thành "18 giây" / "1 phút 22 giây". */
export function formatSeconds(total: number): string {
  if (total < 60) return `${total} giây`;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${minutes} phút ${rest} giây` : `${minutes} phút`;
}
