"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, FileText, Sparkle } from "@phosphor-icons/react/ssr";
import { useDashboard } from "@/hooks/use-dashboard";
import { useSession } from "@/hooks/use-session";
import { HeroFrame, PRIMARY_CTA, SECONDARY_CTA } from "./hero-frame";

/** Đầu trang Tổng quan: lời chào, việc nên làm tiếp, mức hoàn thiện hồ sơ và minh hoạ động bên phải. */
export function DashboardHero() {
  const { user } = useSession();
  const { data } = useDashboard();
  if (!data) return null;

  const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";
  const score = data.todayScore.overall ?? data.averageMatchScore ?? 0;
  const occupation = data.market ? ` ${data.market.occupationName}` : "";
  let jobsLine = <>Có <b className="text-slate-900">{data.matchingJobs.total} tin</b> khớp hồ sơ{occupation} của bạn.</>;
  if (data.matchingJobs.newThisWeek > 0) {
    jobsLine = <>Tuần này có <b className="text-slate-900">{data.matchingJobs.newThisWeek} tin mới</b> khớp hồ sơ{occupation} của bạn.</>;
  }

  return (
    <HeroFrame score={score}>
      <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-semibold text-primary-700">
        <Sparkle weight="fill" className="size-3.5" />
        Chào {firstName}
      </span>
      <h1 className="text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
        Tìm đúng việc, <span className="text-primary-600">chuẩn bị tốt hơn</span>, chinh phục nhà tuyển dụng
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {jobsLine} Tối ưu CV cho tin hợp nhất trước khi nộp để tăng cơ hội được gọi phỏng vấn.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {data.resume ? (
          <Link href={`/dashboard/jobs/${data.resume.jobId}`} className={PRIMARY_CTA}>
            <FileText className="size-4.5" />
            Tiếp tục tối ưu CV
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link href="/dashboard/cv-optimizer" className={PRIMARY_CTA}>
            <FileText className="size-4.5" />
            Tối ưu CV với AI
            <ArrowRight className="size-4" />
          </Link>
        )}
        <Link href="/dashboard/jobs?scored=1" className={SECONDARY_CTA}>
          <Briefcase className="size-4.5" />
          Xem việc làm phù hợp
        </Link>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        <b className="text-sm text-slate-900">{data.profileCompletion}%</b> hồ sơ hoàn thiện
        {data.profileCompletion < 100 && (
          <>
            {" · "}
            <Link href="/dashboard/profile" className="font-semibold text-primary-600 hover:text-primary-700">
              Hoàn thiện hồ sơ
            </Link>
          </>
        )}
      </p>
    </HeroFrame>
  );
}
