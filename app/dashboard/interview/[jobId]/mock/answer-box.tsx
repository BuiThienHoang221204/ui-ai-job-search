"use client";

import { useState } from "react";
import { ArrowElbowDownLeft, PaperPlaneTilt } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";

const ROWS = 5;

/** Ô trả lời văn dài cho một câu phỏng vấn, Ctrl/Cmd + Enter để gửi. */
export function AnswerBox({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="space-y-2">
      <Textarea
        id="interview-answer"
        rows={ROWS}
        value={text}
        disabled={sending}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) send();
        }}
        placeholder="Trả lời như đang nói chuyện thật với người phỏng vấn. Kể theo khung STAR: bối cảnh, việc bạn phụ trách, bạn đã làm gì, kết quả đo được."
        aria-label="Câu trả lời của bạn"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.6875rem]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.6875rem]">
            <ArrowElbowDownLeft className="size-3.5" />
          </kbd>
          <span>để gửi</span>
        </p>

        <Button
          onClick={send}
          disabled={sending || !text.trim()}
          className="ml-auto"
        >
          <PaperPlaneTilt className="size-4" />
          {sending ? "Đang gửi" : "Gửi câu trả lời"}
        </Button>
      </div>
    </div>
  );
}
