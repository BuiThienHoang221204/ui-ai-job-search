"use client";

import { useEffect, useRef } from "react";
import { formatCount } from "@/lib/number";

const DURATION_MS = 1200;

/** Số đếm từ 0 lên một lần khi hiện ra; ghi thẳng vào DOM nên không render lại component nào, giảm chuyển động thì hiện số cuối ngay. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = reduced ? 1 : Math.min((now - start) / DURATION_MS, 1);
      if (ref.current) {
        ref.current.textContent = formatCount(
          Math.round(value * (1 - (1 - t) ** 3)),
        );
      }
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}
