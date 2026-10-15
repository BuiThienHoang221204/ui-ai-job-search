"use client";

import { Progress } from "@/components/ui/progress";
import { formatSeconds, progressFor } from "@/lib/elapsed";
import { cn } from "@/lib/cn";
import { useElapsedSeconds } from "@/hooks/use-elapsed";

/** Đồng hồ đếm thời gian cho một tác vụ gọi model, so với thời gian dự kiến. */
export function ModelElapsed({
  expected = 10,
  className,
}: {
  expected?: number;
  className?: string;
}) {
  const elapsed = useElapsedSeconds();

  return (
    <div className={cn("mb-3", className)}>
      <p className="mb-1.5 text-xs text-slate-600">
        {elapsed > expected
          ? `Đã ${formatSeconds(elapsed)} — lâu hơn thường lệ, vẫn đang chạy`
          : `Đã ${formatSeconds(elapsed)}, thường mất khoảng ${formatSeconds(expected)}`}
      </p>
      <Progress value={progressFor(elapsed, expected)} />
    </div>
  );
}
