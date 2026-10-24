import { FlagCheckered, Microphone, WifiSlash } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

/** Thay sân khấu giọng nói khi kết nối bị ngắt: đã có câu trả lời thì kết thúc để lấy tổng kết, chưa có thì bắt đầu lại. */
export function VoiceDropped({
  answered,
  onFinish,
  onRestart,
}: {
  answered: number;
  onFinish: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="from-primary-50 grid justify-items-center gap-2 border-b border-slate-100 bg-radial-[at_50%_0%] to-white to-70% px-5 pt-7 pb-6 text-center">
      <span className="flex size-13 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 ring-inset">
        <WifiSlash className="size-6.5" weight="fill" />
      </span>
      <h3 className="mt-1 text-[17px] font-semibold text-slate-900">
        Kết nối giọng nói bị ngắt
      </h3>
      {answered > 0 ? (
        <>
          <p className="max-w-lg text-[14.5px] text-slate-600">
            {answered} câu bạn đã trả lời vẫn được lưu. Kết thúc để nhận lời
            tổng kết cho các câu đó, hoặc bắt đầu lại buổi mới.
          </p>
          <Button className="mt-1.5" onClick={onFinish}>
            <FlagCheckered className="size-4" />
            Kết thúc và xem tổng kết
          </Button>
        </>
      ) : (
        <>
          <p className="max-w-lg text-[14.5px] text-slate-600">
            Chưa có câu trả lời nào được lưu. Kiểm tra mạng rồi bắt đầu lại.
          </p>
          <Button className="mt-1.5" onClick={onRestart}>
            <Microphone className="size-4" />
            Bắt đầu lại bằng giọng nói
          </Button>
        </>
      )}
    </div>
  );
}
