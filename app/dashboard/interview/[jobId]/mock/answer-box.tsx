"use client";

import { useState } from "react";
import { ArrowUp } from "@phosphor-icons/react/ssr";
import { Textarea } from "@/components/ui/form";

/** Ô trả lời dạng ô chat: một dòng lúc đầu, tự cao lên khi viết dài, Ctrl/Cmd + Enter để gửi. */
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
    <div className="sticky bottom-0 rounded-b-2xl bg-linear-to-b from-transparent to-white to-30% px-5 pt-3 pb-3.5">
      <div className="focus-within:border-primary-200 focus-within:ring-primary-50 flex items-end gap-2 rounded-[1.625rem] border border-slate-200 bg-white py-1.5 pr-1.5 pl-4.5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] focus-within:ring-4">
        <Textarea
          id="interview-answer"
          rows={1}
          value={text}
          disabled={sending}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey))
              send();
          }}
          className="field-sizing-content max-h-56 min-h-0 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-[15px] leading-relaxed shadow-none focus:ring-0"
          placeholder="Trả lời như đang nói chuyện thật, kể theo khung STAR…"
          aria-label="Câu trả lời của bạn"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !text.trim()}
          title="Gửi câu trả lời"
          aria-label="Gửi câu trả lời"
          className="bg-primary-600 hover:bg-primary-700 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <ArrowUp className="size-4.5" weight="bold" />
        </button>
      </div>
      <p className="mt-2 hidden items-center justify-center gap-1.5 text-xs text-slate-400 sm:flex">
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.6875rem] text-slate-500">
          Ctrl
        </kbd>
        +
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.6875rem] text-slate-500">
          Enter
        </kbd>
        để gửi
      </p>
    </div>
  );
}
