"use client";

import { Progress } from "@/components/ui/progress";
import {
  formatSeconds,
  progressFor,
  useElapsedSeconds,
} from "@/lib/use-elapsed";
import { cn } from "@/utils";

/** Đồng hồ cho một tác vụ gọi model — mọi lượt nay đi đường KHÔNG stream nên màn hình im lặng 40-254 giây. `expected` lấy từ số ĐO THẬT trong `ai_calls`, đừng đoán. */
export function ModelElapsed({
  expected,
  className,
}: {
  expected: number;
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
