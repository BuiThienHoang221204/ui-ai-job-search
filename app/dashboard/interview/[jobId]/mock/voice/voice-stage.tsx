"use client";

import { useEffect } from "react";
import {
  Microphone,
  MicrophoneSlash,
  Timer,
  UserSound,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import type { useVoiceInterview } from "@/hooks/use-voice-interview";
import { cn } from "@/lib/cn";

const METER_BARS = [0.3, 0.55, 0.85, 0.6, 0.35];
const MODE_TABS = [
  { value: "auto", label: "Tự nghe" },
  { value: "hold", label: "Giữ để nói" },
];

/** Sân khấu buổi luyện giọng nói: vòng tròn người phỏng vấn, phụ đề hai phía, chế độ nghe, mức micro. */
export function VoiceStage({
  voice,
}: {
  voice: ReturnType<typeof useVoiceInterview>;
}) {
  const hold = voice.mode === "hold";
  const listening = voice.status === "listening" || voice.holding;
  const { hold: press, meter } = voice;

  useEffect(() => {
    if (!hold) return;
    const typing = (event: KeyboardEvent) =>
      event.target instanceof HTMLElement &&
      ["INPUT", "TEXTAREA"].includes(event.target.tagName);
    const down = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || typing(event)) return;
      event.preventDefault();
      press(true);
    };
    const up = (event: KeyboardEvent) => {
      if (event.code !== "Space" || typing(event)) return;
      event.preventDefault();
      press(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [hold, press]);

  let hint = "Bạn có thể nói chen vào bất cứ lúc nào, AI sẽ dừng lại nghe.";
  if (voice.status === "connecting") hint = "Đang mở micro và kết nối với người phỏng vấn…";
  if (listening) hint = "Cứ thoải mái dừng lại suy nghĩ, AI sẽ chờ bạn nói xong.";
  if (hold && !voice.holding) hint = "";

  return (
    <div className="border-b border-slate-100">
      <div className="from-primary-50 grid justify-items-center gap-3.5 bg-radial-[at_50%_0%] to-white to-70% px-5 pt-7 pb-5.5">
        <div
          className={cn(
            "relative flex size-28 items-center justify-center rounded-full",
            listening
              ? "bg-white text-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.18)] ring-3 ring-emerald-500"
              : "bg-primary-600 text-white shadow-lg",
          )}
        >
          {voice.status !== "connecting" && (
            <span
              className={cn(
                "absolute -inset-2.5 animate-ping rounded-full border-2 [animation-duration:1.6s]",
                listening ? "border-emerald-200" : "border-primary-200",
              )}
            />
          )}
          {listening ? (
            <Microphone className="size-11" weight="fill" />
          ) : (
            <UserSound className="size-11" weight="fill" />
          )}
        </div>

        <p
          className={cn(
            "min-h-13 max-w-[38rem] text-center leading-normal",
            listening
              ? "font-medium text-slate-400"
              : "text-[17px] font-semibold text-slate-900",
          )}
        >
          {voice.caption}
        </p>
        {voice.heard && (
          <p className="max-w-[38rem] text-center text-base leading-normal text-emerald-700">
            “{voice.heard}”
          </p>
        )}
        {voice.lastMinute && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[13px] font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
            <Timer className="size-4" weight="fill" />
            Còn 1 phút. Buổi luyện sẽ tự kết thúc, các câu đã trả lời vẫn được
            tổng kết.
          </p>
        )}
        {hint && <p className="text-[13px] text-slate-500">{hint}</p>}
      </div>

      {hold && (
        <div className="grid justify-items-center gap-2 border-t border-slate-100 px-5 pt-4.5 pb-5">
          <Button
            size="lg"
            onPointerDown={() => press(true)}
            onPointerUp={() => press(false)}
            onPointerLeave={() => press(false)}
            className={cn(
              "h-13.5 rounded-full px-6.5 text-[15px] select-none",
              voice.holding
                ? "bg-emerald-600 ring-6 ring-emerald-50 hover:bg-emerald-600"
                : "bg-slate-900 hover:bg-slate-800",
            )}
          >
            <Microphone className="size-5" weight="fill" />
            {voice.holding ? "Đang nghe… thả ra để gửi" : "Giữ để nói"}
          </Button>
          <p className="max-w-md text-center text-[12.5px] text-slate-500">
            Giữ{" "}
            <kbd className="rounded border border-b-2 border-slate-200 bg-slate-50 px-1.5 font-mono text-[11.5px] text-slate-600">
              Space
            </kbd>{" "}
            hoặc giữ nút này trong lúc nói. AI chỉ nghe khi bạn đang giữ, nên
            tiếng người xung quanh không lọt vào.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <Tabs
          tabs={MODE_TABS}
          value={voice.mode}
          onChange={(value) => voice.changeMode(value === "hold" ? "hold" : "auto")}
        />

        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <span
            ref={meter}
            aria-hidden
            className="flex h-4.5 items-end gap-0.75 [--level:0]"
          >
            {METER_BARS.map((height) => (
              <i
                key={height}
                className="w-1 rounded-sm bg-emerald-500 transition-[height] duration-100"
                style={{ height: `calc(${height * 100}% * var(--level) + 3px)` }}
              />
            ))}
          </span>
          Micro
          <Button
            variant="outline"
            size="icon"
            onClick={voice.toggleMute}
            title={voice.muted ? "Bật micro" : "Tắt micro"}
            aria-label={voice.muted ? "Bật micro" : "Tắt micro"}
            className={cn(
              "rounded-full",
              voice.muted &&
                "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-50",
            )}
          >
            {voice.muted ? (
              <MicrophoneSlash className="size-4.5" />
            ) : (
              <Microphone className="size-4.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
