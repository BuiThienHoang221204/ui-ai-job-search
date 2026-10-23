"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const LONG_ANSWER = 400;

/** Bong bóng câu trả lời của người dùng; câu dài gập lại còn 5 dòng. */
export function AnswerBubble({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > LONG_ANSWER;

  return (
    <div className="flex flex-col items-end">
      <div className="border-primary-100 bg-primary-50 max-w-[86%] rounded-2xl rounded-br-sm border px-4 py-3">
        <p
          className={cn(
            "text-[15px] leading-relaxed whitespace-pre-line text-slate-800",
            long && !expanded && "line-clamp-5",
          )}
        >
          {text}
        </p>
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((was) => !was)}
          className="text-primary-600 mt-1.5 cursor-pointer text-[13px] font-semibold hover:underline"
        >
          {expanded ? "Thu gọn" : "Xem toàn bộ"}
        </button>
      )}
    </div>
  );
}
