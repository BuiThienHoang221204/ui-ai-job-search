import { ChatsCircle, Microphone, Sparkle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

/** Màn bắt đầu buổi luyện: chọn trả lời bằng chữ hoặc nói chuyện bằng giọng nói. */
export function ModeChoice({
  busy,
  question,
  onText,
  onVoice,
}: {
  busy: boolean;
  question?: string;
  onText: () => void;
  onVoice: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-display text-xl font-semibold text-slate-900">
        Bắt đầu một buổi luyện
      </h2>
      <p className="mt-1 text-slate-500">
        Người phỏng vấn ảo bám theo đúng tin tuyển dụng, hồ sơ và bộ đề chuẩn bị
        bạn đã có.
      </p>

      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
        <div className="grid content-start gap-2.5 rounded-2xl border border-slate-200 p-4.5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <ChatsCircle className="text-primary-600 size-5.5" weight="duotone" />
            Trả lời bằng chữ
          </h3>
          <ul className="list-disc space-y-0.5 pl-4.5 text-sm text-slate-600">
            <li>Đọc câu hỏi, gõ câu trả lời, có thời gian suy nghĩ.</li>
            <li>Nhận xét chi tiết sau từng câu.</li>
            {question ? (
              <li>Người phỏng vấn hỏi đúng câu bạn chọn trước: «{question}»</li>
            ) : (
              <li>Không cần micro.</li>
            )}
          </ul>
          <Button
            variant="outline"
            size="lg"
            className="mt-1 justify-self-start"
            onClick={onText}
            disabled={busy}
          >
            <Sparkle className="size-4" />
            Bắt đầu bằng chữ
          </Button>
        </div>

        <div className="border-primary-200 from-primary-50 grid content-start gap-2.5 rounded-2xl border bg-linear-to-b to-white to-60% p-4.5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Microphone className="text-primary-600 size-5.5" weight="duotone" />
            Nói chuyện bằng giọng nói
            <span className="bg-primary-600 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
              MỚI
            </span>
          </h3>
          <ul className="list-disc space-y-0.5 pl-4.5 text-sm text-slate-600">
            <li>AI hỏi bằng giọng nói, bạn trả lời như đang gọi video.</li>
            <li>Cần micro, nên đeo tai nghe để AI không nghe lại chính nó.</li>
            <li>
              Tối đa 20 phút một buổi, 30 phút trong 24 giờ. Tổng kết bằng chữ
              khi kết thúc.
            </li>
          </ul>
          <Button
            size="lg"
            className="mt-1 justify-self-start"
            onClick={onVoice}
            disabled={busy}
          >
            <Microphone className="size-4" />
            {busy ? "Đang kết nối" : "Bắt đầu nói chuyện"}
          </Button>
        </div>
      </div>
    </section>
  );
}
