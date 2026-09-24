"use client";

import { useEffect, useState } from "react";

/** Số giây kể từ khi component GẮN VÀO — nơi dùng vốn render có điều kiện, nên gắn/gỡ chính là bắt đầu/kết thúc. */
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

/** KHÔNG bao giờ chạm 100 khi chưa xong: tới mốc kỳ vọng là 85%, quá mốc thì bò chậm về 95%. */
export function progressFor(elapsed: number, expected: number): number {
  if (elapsed <= 0) return 0;
  if (elapsed < expected) return Math.round((elapsed / expected) * 85);
  const over = elapsed - expected;
  return Math.min(95, 85 + Math.round((over / (over + expected)) * 10));
}

/** "18 giây" / "1 phút 22 giây". */
export function formatSeconds(total: number): string {
  if (total < 60) return `${total} giây`;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${minutes} phút ${rest} giây` : `${minutes} phút`;
}
