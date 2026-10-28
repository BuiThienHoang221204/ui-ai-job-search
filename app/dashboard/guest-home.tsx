"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowsClockwise,
  Buildings,
  ChartLineUp,
  CurrencyCircleDollar,
  Envelope,
  FileMagnifyingGlass,
  FileText,
  Gift,
  GraduationCap,
  LockSimple,
  MapPin,
  Microphone,
  Question,
  ShieldCheck,
  Stack,
  Target,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/hooks/use-login-modal";
import { formatCount } from "@/lib/number";
import type { MarketOccupation } from "@/types";
import { CountUp } from "./count-up";
import { HeroDemo } from "./hero-demo";

const FEATURES = [
  {
    icon: FileMagnifyingGlass,
    title: "Phân tích CV",
    free: true,
    note: "Điểm theo 8 tiêu chí, câu nên viết lại, máy lọc hồ sơ (ATS) đọc CV thế nào và câu hỏi phỏng vấn dự đoán.",
  },
  {
    icon: Stack,
    title: "Việc làm mọi ngành",
    free: true,
    note: "Tin từ nhiều trang tuyển dụng gom một chỗ, lọc theo ngành, tỉnh, ngày đăng.",
  },
  {
    icon: ChartLineUp,
    title: "Thị trường việc làm",
    free: true,
    note: "Lương trung vị, kỹ năng được tìm nhiều nhất theo từng ngành, 30 ngày gần nhất.",
  },
  {
    icon: CurrencyCircleDollar,
    title: "Tra cứu lương",
    free: true,
    note: "Khoảng lương phổ biến của từng vị trí, tách theo số năm kinh nghiệm.",
  },
  {
    icon: Target,
    title: "Việc làm hợp với bạn",
    free: false,
    note: "Đối chiếu yêu cầu từng tin với hồ sơ, AI chấm độ hợp và chỉ ra kỹ năng còn thiếu.",
  },
  {
    icon: FileText,
    title: "Tối ưu CV theo từng tin",
    free: false,
    note: "Viết CV bám từ khoá của tin, sửa thẳng trên trang, gợi ý viết lại từng dòng, xuất PDF.",
  },
  {
    icon: Envelope,
    title: "Thư xin việc",
    free: false,
    note: "Thư viết riêng cho từng tin, dùng chung mẫu với CV, xuất PDF.",
  },
  {
    icon: Buildings,
    title: "Tìm hiểu công ty",
    free: false,
    note: "Tóm tắt đánh giá công ty từ nhiều nguồn: ưu, nhược điểm và có nên ứng tuyển.",
  },
  {
    icon: Microphone,
    title: "Luyện phỏng vấn",
    free: false,
    note: "Câu hỏi theo tin bạn ứng tuyển, phỏng vấn thử bằng chữ hoặc giọng nói, có nhận xét từng câu.",
  },
  {
    icon: Question,
    title: "Ngân hàng câu hỏi",
    free: false,
    note: "Câu hỏi phỏng vấn lọc theo ngành nghề và loại câu hỏi, tự trả lời và nhận góp ý.",
  },
  {
    icon: GraduationCap,
    title: "Lộ trình học",
    free: false,
    note: "Kỹ năng còn thiếu so với tin bạn nhắm, kèm tài liệu học và nhắc học theo giờ bạn chọn.",
  },
  {
    icon: Gift,
    title: "Mời bạn bè",
    free: false,
    note: "Bạn bè đăng ký qua link của bạn, cả hai được thêm phút luyện phỏng vấn bằng giọng nói.",
  },
];

const MICRO = [
  { icon: LockSimple, text: "Phân tích CV không cần đăng nhập" },
  { icon: ShieldCheck, text: "File không rời máy bạn" },
  { icon: ArrowsClockwise, text: "Tin mới mỗi đêm" },
];

/** Trang chào của `/dashboard` cho khách: phân tích CV là lối vào chính, kèm số liệu thật về việc làm và các tính năng mở khi có tài khoản. */
export function GuestHome({
  occupations,
  jobCount,
}: {
  occupations: MarketOccupation[];
  jobCount: number | null;
}) {
  const openLogin = useLoginModal((state) => state.open);
  const recent = occupations.reduce((sum, item) => sum + item.total, 0);
  const top = [...occupations].sort((a, b) => b.total - a.total).slice(0, 6);

  const stats = [
    { value: jobCount ?? 0, label: "Tin đang tuyển" },
    { value: occupations.length, label: "Ngành nghề" },
    { value: recent, label: "Tin 30 ngày qua" },
  ].filter((stat) => stat.value > 0);

  return (
    <div className="guest-hero relative overflow-hidden rounded-2xl border border-slate-200 text-slate-700">
      <span aria-hidden className="guest-glow" />
      <section className="relative grid items-center gap-9 px-6 py-9 sm:px-11 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="animate-fade-up">
          <span className="shine border-primary-200 text-primary-700 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold">
            <MapPin className="size-4" />
            Cho người tìm việc ở Việt Nam · mọi ngành nghề
          </span>
          <h1 className="font-display mt-4 text-3xl leading-tight text-slate-900 sm:text-[2.6rem]">
            Tìm việc đúng ngành,
            <br />
            <span className="from-primary-600 to-primary-700 bg-linear-to-r bg-clip-text text-transparent">
              CV qua được vòng lọc
            </span>
          </h1>
          <p className="mt-3 font-semibold text-slate-600">
            TopCV · ITviec · VietnamWorks · CareerViet · Vieclam24h
          </p>
          <p className="mt-3 max-w-xl text-slate-600">
            Gom tin tuyển dụng mỗi đêm, AI chấm độ hợp với hồ sơ của bạn, viết
            CV và thư theo từng tin, luyện phỏng vấn. Bắt đầu bằng việc phân
            tích CV — miễn phí, không cần tài khoản.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/dashboard/cv-check">
              <Button size="lg">
                <FileMagnifyingGlass className="size-4.5" />
                Phân tích CV
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard/jobs">
              <Button size="lg" variant="outline">
                <Stack className="size-4.5" />
                Xem việc làm
              </Button>
            </Link>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            {MICRO.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5" />
                {text}
              </span>
            ))}
          </div>
          {stats.length > 0 && (
            <div className="mt-7 flex flex-wrap border-t border-slate-200 pt-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="mr-6 border-r border-slate-200 pr-6 last:mr-0 last:border-r-0 last:pr-0"
                >
                  <p className="font-display text-3xl text-slate-900">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
          <HeroDemo jobCount={jobCount} />
        </div>
      </section>

      <section className="relative px-6 pt-4 sm:px-11">
        <p className="text-primary-600 text-xs font-bold tracking-widest uppercase">
          Tính năng
        </p>
        <h2 className="font-display mt-2 text-2xl text-slate-900 sm:text-3xl">
          Từ lúc tìm việc tới lúc phỏng vấn
        </h2>
        <p className="mt-1.5 max-w-2xl text-slate-600">
          Bắt đầu từ chỗ bạn đang cần: sửa CV, tìm tin đúng ngành, viết thư hay
          luyện trả lời phỏng vấn.
        </p>
        <div className="mt-5 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, free, note }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-4.5"
            >
              <div className="flex items-center justify-between">
                <span className="bg-primary-50 text-primary-600 grid size-9.5 place-items-center rounded-lg">
                  <Icon weight="duotone" className="size-5.5" />
                </span>
                {free ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-2xs font-bold text-emerald-700">
                    Miễn phí
                  </span>
                ) : (
                  <span className="bg-primary-50 rounded-full px-2.5 py-0.5 text-2xs font-bold text-slate-600">
                    Cần tài khoản
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {top.length > 0 && (
        <section className="relative px-6 pt-9 sm:px-11">
          <p className="text-primary-600 text-xs font-bold tracking-widest uppercase">
            Đang tuyển nhiều
          </p>
          <h2 className="font-display mt-2 text-2xl text-slate-900 sm:text-3xl">
            Ngành có nhiều tin nhất 30 ngày qua
          </h2>
          <div className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {top.map((occupation) => (
              <Link
                key={occupation.slug}
                href={`/dashboard/market/${occupation.slug}`}
                className="hover:border-primary-200 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 transition-colors"
              >
                {occupation.name}
                <span className="text-primary-600 font-mono text-xs font-semibold">
                  {formatCount(occupation.total)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-primary-200 from-primary-100/60 relative m-6 rounded-2xl border bg-linear-to-br to-transparent p-7 text-center sm:m-11">
        <h2 className="font-display text-2xl text-slate-900">
          CV của bạn được bao nhiêu điểm?
        </h2>
        <p className="mt-1.5 mb-5 text-slate-600">
          Thả CV vào là biết trong nửa phút. Miễn phí, không cần tài khoản.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/dashboard/cv-check">
            <Button size="lg">
              <FileMagnifyingGlass className="size-4.5" />
              Phân tích CV
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openLogin({ mode: "register" })}
          >
            Tạo tài khoản miễn phí
          </Button>
        </div>
      </section>
    </div>
  );
}
