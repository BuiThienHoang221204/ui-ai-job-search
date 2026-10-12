import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import type { CvGenerate } from "@/types";
import { CvSourceCard } from "../cv-source-card";
import { HeroArt } from "./hero-art";

const STEPS = [
  { label: "Chọn tin", description: "Tin đã có, mô tả hoặc link" },
  { label: "AI viết CV", description: "Khoảng 40–80 giây" },
  { label: "Hoàn thiện & tải PDF", description: "Sửa theo danh sách gợi ý" },
];

/** Thẻ đầu trang Tối ưu CV: lời giới thiệu, ô chọn tin để tạo CV và ba bước của quy trình. */
export function CvHero({
  fixedJobId,
  onGenerate,
}: {
  fixedJobId: string | null;
  onGenerate: CvGenerate;
}) {
  return (
    <Card className="relative p-6 sm:p-7">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
        <Sparkle className="size-3.5" />
        Viết bằng AI · không ghi đè hồ sơ gốc
      </span>
      <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Mỗi tin một bản CV riêng, viết đúng điều nhà tuyển dụng cần
      </h1>
      <p className="mt-2 mb-5 max-w-2xl text-sm text-slate-600">
        AI đọc yêu cầu của tin rồi viết lại CV từ{" "}
        <Link
          href="/dashboard/profile"
          className="font-semibold text-slate-900 underline"
        >
          hồ sơ của bạn
        </Link>{" "}
        — đưa kỹ năng liên quan lên đầu, dùng đúng từ khoá của tin.
      </p>
      <HeroArt />

      <CvSourceCard fixedJobId={fixedJobId} onSubmit={onGenerate} />

      <Stepper steps={STEPS} current={0} className="mt-6" />
    </Card>
  );
}
