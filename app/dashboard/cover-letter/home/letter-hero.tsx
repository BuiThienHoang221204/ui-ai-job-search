import { Sparkle } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";
import type { LetterGenerate, LetterKind } from "@/types";
import { LetterArt } from "./letter-art";
import { LetterBuilder } from "./letter-builder";

/** Thẻ đầu trang Thư xin việc: lời giới thiệu và khung chọn tin, chọn loại thư để AI viết. */
export function LetterHero({
  fixedJobId,
  fixedKind,
  onGenerate,
}: {
  fixedJobId: string | null;
  fixedKind: LetterKind | null;
  onGenerate: LetterGenerate;
}) {
  return (
    <Card className="relative p-6 sm:p-7">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
        <Sparkle className="size-3.5" />
        Viết bằng AI · từ hồ sơ và đúng tin của bạn
      </span>
      <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Mail ứng tuyển và thư xin việc, viết riêng cho từng tin
      </h1>
      <p className="mt-2 mb-8 max-w-2xl text-sm text-slate-600">
        Nhà tuyển dụng nhận ra thư viết chung chung ngay lập tức. AI dựa vào hồ
        sơ của bạn và đúng yêu cầu của tin — bạn chỉ cần soát lại rồi gửi.
      </p>
      <LetterArt />
      <LetterBuilder
        fixedJobId={fixedJobId}
        fixedKind={fixedKind}
        onGenerate={onGenerate}
      />
    </Card>
  );
}
