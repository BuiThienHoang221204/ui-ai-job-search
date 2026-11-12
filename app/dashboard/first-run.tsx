"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Check, FileText, Lightbulb, Sparkle, Target, UploadSimple } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashSection } from "@/components/ui/dash-section";
import { useDashboard } from "@/hooks/use-dashboard";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/cn";
import { HeroFrame, PRIMARY_CTA, SECONDARY_CTA } from "./hero-frame";
import { MarketCard } from "./market-card";
import { TopMatches } from "./top-matches";

const SAMPLE_SCORE = 85;

const BENEFITS = [
  { icon: Target, title: "Điểm phù hợp cho từng tin", detail: "So hồ sơ với yêu cầu của tin, biết hợp ở đâu, thiếu ở đâu." },
  { icon: Lightbulb, title: "Gợi ý tối ưu", detail: "Kỹ năng nên học thêm, chỗ nên sửa trong hồ sơ." },
  { icon: FileText, title: "CV và thư xin việc theo từng tin", detail: "Viết lại CV cho đúng tin bạn muốn ứng tuyển." },
];

/** Tổng quan cho tài khoản chưa có lần chấm AI nào: hero kèm các bước bắt đầu, việc mới trong ngành, thẻ mở khoá và số liệu ngành. */
export function FirstRun() {
  const { user } = useSession();
  const { data } = useDashboard();
  if (!data) return null;

  const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";
  const occupation = data.market?.occupationName ?? "trong ngành của bạn";
  const hasProfile = data.profileCompletion > 0;
  const steps = [
    { title: "Chọn ngành nghề", detail: data.market?.occupationName ?? "Đã chọn", done: true },
    { title: "Tải CV lên", detail: "Tự đọc kinh nghiệm, kỹ năng từ file PDF", done: hasProfile },
    { title: "Chấm điểm một tin", detail: "Mở một tin và bấm chấm điểm", done: false },
  ];
  const current = steps.findIndex((step) => !step.done);
  const unlock = hasProfile
    ? { title: "Chấm điểm một tin để mở khoá", label: "Chọn một tin để chấm", href: "/dashboard/jobs?scored=1" }
    : { title: "Tải CV lên để mở khoá", label: "Tải CV lên", href: "/dashboard/profile/upload" };

  return (
    <>
      <HeroFrame score={SAMPLE_SCORE}>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-semibold text-primary-700">
          <Sparkle weight="fill" className="size-3.5" />
          Chào {firstName}
        </span>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Bắt đầu với việc làm <span className="text-primary-600">{occupation}</span>
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-600">
          {hasProfile
            ? "Hồ sơ đã có. Chấm điểm một tin để thấy hệ thống so sánh hồ sơ với yêu cầu của tin thế nào."
            : "Bạn đã chọn ngành nên xem được việc ngay. Tải CV lên để mỗi tin có điểm phù hợp và lý do vì sao hợp."}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {hasProfile ? (
            <Link href="/dashboard/jobs?scored=1" className={PRIMARY_CTA}>
              <Briefcase className="size-4.5" />
              Chọn một tin để chấm
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link href="/dashboard/profile/upload" className={PRIMARY_CTA}>
                <UploadSimple className="size-4.5" />
                Tải CV lên
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard/jobs?scored=1" className={SECONDARY_CTA}>
                <Briefcase className="size-4.5" />
                Xem việc làm phù hợp
              </Link>
            </>
          )}
        </div>
        <ol className="grid gap-3 border-t border-primary-200/60 pt-4 sm:grid-cols-3">
          {steps.map((step, index) => {
            const isNow = index === current;
            return (
              <li key={step.title} className="flex gap-2.5">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] text-2xs font-bold",
                    step.done && "border-primary-600 bg-primary-600 text-white",
                    isNow && "border-primary-600 bg-white text-primary-700 ring-4 ring-primary-100",
                    !step.done && !isNow && "border-slate-300 bg-white text-slate-500",
                  )}
                >
                  {step.done ? <Check weight="bold" className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-sm font-semibold", step.done || isNow ? "text-slate-900" : "text-slate-500")}>
                    {step.title}
                  </span>
                  <span className="block text-xs text-slate-600">{step.detail}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </HeroFrame>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2 lg:row-span-2">
          <TopMatches newcomer />
        </Card>
        <Card className="border-primary-100 bg-[linear-gradient(160deg,var(--color-primary-50),#fff_70%)]">
          <DashSection title={unlock.title}>
            <ul className="grid gap-3">
              {BENEFITS.map((item) => {
                const BenefitIcon = item.icon;
                return (
                  <li key={item.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2.5">
                    <span className="grid size-8 place-items-center rounded-lg border border-primary-100 bg-white text-primary-600">
                      <BenefitIcon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className="block text-xs text-slate-600">{item.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link href={unlock.href} className="mt-4 block">
              <Button variant="outline" className="w-full justify-center">
                {unlock.label}
              </Button>
            </Link>
          </DashSection>
        </Card>
        <Card>
          <MarketCard />
        </Card>
      </div>
    </>
  );
}
