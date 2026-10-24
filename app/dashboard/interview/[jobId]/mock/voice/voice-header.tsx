"use client";

import { useEffect, useState } from "react";
import { StopCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import type { useVoiceInterview } from "@/hooks/use-voice-interview";
import { cn } from "@/lib/cn";

const STATUS = {
  idle: { label: "Đang kết nối", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  connecting: { label: "Đang kết nối", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  ai: { label: "AI đang nói", tone: "bg-primary-50 text-primary-700 ring-primary-200" },
  listening: { label: "Đang nghe bạn", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  ending: { label: "Đang kết thúc", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
};

/** Góc phải khung buổi luyện giọng nói: trạng thái, thời gian còn lại, nút kết thúc. */
export function VoiceHeader({
  voice,
}: {
  voice: ReturnType<typeof useVoiceInterview>;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = voice.expiresAt
    ? Math.max(0, new Date(voice.expiresAt).getTime() - now)
    : null;
  const seconds = Math.floor((left ?? 0) / 1000);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const status = STATUS[voice.holding ? "listening" : voice.status];

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span
        className={cn(
          "inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-semibold ring-1 ring-inset before:size-1.75 before:rounded-full before:bg-current",
          status.tone,
        )}
      >
        {status.label}
      </span>
      {left !== null && (
        <span
          className={cn(
            "px-1 font-mono text-[12.5px] font-semibold",
            seconds < 60 ? "text-amber-700" : "text-slate-500",
          )}
          title="Buổi luyện tự kết thúc khi hết giờ, các câu đã trả lời vẫn được tổng kết"
        >
          Còn {clock}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={voice.stop}
        disabled={voice.status === "ending" || voice.status === "connecting"}
      >
        <StopCircle className="size-4" />
        Kết thúc buổi luyện
      </Button>
    </div>
  );
}
