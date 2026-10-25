"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";

/** Lời mời cuối báo cáo: khách thì đăng ký, đã đăng nhập thì sang Lộ trình học. */
export function MarketCta() {
  const { user } = useSession();
  let cta = {
    title: "CV của bạn đủ những kỹ năng này chưa?",
    detail: "Tải CV lên để xem tin hợp với bạn và kỹ năng còn thiếu.",
    href: "/register",
    label: "Đăng ký miễn phí",
  };
  if (user) {
    cta = {
      title: "Bạn còn thiếu kỹ năng nào trong số này?",
      detail: "Lộ trình học so các kỹ năng được tuyển nhiều với hồ sơ của bạn.",
      href: "/dashboard/upskill",
      label: "Xem lộ trình học",
    };
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{cta.title}</p>
        <p className="text-sm text-slate-500">{cta.detail}</p>
      </div>
      <Link
        href={cta.href}
        className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-semibold text-white"
      >
        {cta.label}
      </Link>
    </div>
  );
}
