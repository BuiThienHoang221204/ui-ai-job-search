"use client";

import { ArrowClockwise, ChatsCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { useVoiceInterview } from "@/hooks/use-voice-interview";
import type { MicFailure } from "@/types";

const MIC_TEXT: Record<MicFailure, { title: string; body: string }> = {
  blocked: {
    title: "Trình duyệt đang chặn micro",
    body: "Cần micro để người phỏng vấn nghe được bạn. Mở lại quyền micro cho trang này:",
  },
  missing: {
    title: "Không tìm thấy micro",
    body: "Máy chưa có micro nào đang hoạt động. Cắm tai nghe có micro (hoặc bật micro trong cài đặt âm thanh) rồi thử lại.",
  },
  busy: {
    title: "Micro đang được ứng dụng khác dùng",
    body: "Tắt Zoom, Google Meet, Teams hoặc tab khác đang dùng micro, rồi thử lại.",
  },
  other: {
    title: "Chưa mở được micro",
    body: "Trình duyệt báo lỗi khi mở micro:",
  },
};

const STEPS = [
  "Bấm biểu tượng ổ khoá hoặc biểu tượng cài đặt ở bên trái thanh địa chỉ.",
  "Ở mục Micro, chọn Cho phép.",
  "Bấm Thử lại bên dưới.",
];

/** Hộp thoại lỗi khi bắt đầu buổi luyện giọng nói: hiện giữa màn hình để người bấm ở cuối trang vẫn thấy, kèm cách gỡ và đường lui sang luyện bằng chữ. */
export function VoiceProblemModal({
  voice,
  onText,
}: {
  voice: ReturnType<typeof useVoiceInterview>;
  onText: () => void;
}) {
  const { problem } = voice;
  if (!problem) return null;

  const text =
    problem.kind === "microphone"
      ? MIC_TEXT[problem.failure]
      : { title: "Chưa bắt đầu được buổi luyện bằng giọng nói", body: "" };
  const blocked = problem.kind === "microphone" && problem.failure === "blocked";
  const detail =
    problem.kind === "start" ||
    (problem.kind === "microphone" && problem.failure === "other");

  return (
    <Modal open onClose={voice.dismiss} title={text.title}>
      {text.body && <p className="text-sm text-slate-600">{text.body}</p>}

      {detail && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-slate-700">
          {problem.message}
        </p>
      )}

      {blocked && (
        <>
          <ol className="mt-3 space-y-2.5 rounded-xl bg-slate-50 p-3.5">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[1.5rem_1fr] gap-2.5 text-sm text-slate-700"
              >
                <span className="text-primary-700 ring-primary-100 flex size-6 items-center justify-center rounded-md bg-white font-mono text-xs font-bold ring-1 ring-inset">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <details className="mt-2.5 text-[13px] text-slate-500">
            <summary className="cursor-pointer font-semibold text-slate-600">
              Đã cho phép mà vẫn lỗi?
            </summary>
            <p className="mt-1.5">
              Windows có thể đang chặn trình duyệt: mở Settings → Privacy &amp;
              security → Microphone, bật cho trình duyệt rồi thử lại.
            </p>
          </details>
        </>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            voice.dismiss();
            onText();
          }}
        >
          <ChatsCircle className="size-4" />
          Luyện bằng chữ
        </Button>
        {problem.kind === "microphone" && (
          <Button onClick={voice.start}>
            <ArrowClockwise className="size-4" />
            Thử lại
          </Button>
        )}
      </div>
    </Modal>
  );
}
