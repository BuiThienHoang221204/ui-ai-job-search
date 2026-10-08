"use client";

import Link from "next/link";
import { Check } from "@phosphor-icons/react/ssr";
import { jobsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { toJobCardFromRecord } from "@/lib/adapters";
import { SkillResources } from "@/components/ads/affiliate-inline";
import { DashSection } from "@/components/dashboard/dash-section";
import { useSession } from "@/components/dashboard/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import { MarketCard } from "./market-card";
import { JobRow } from "./top-matches";
import { useDashboard } from "./use-dashboard";

type Step = { title: string; detail: string; done: boolean; action?: { label: string; href: string } };

const BENEFITS = [
  { title: "Điểm phù hợp cho từng tin", detail: "So hồ sơ với yêu cầu của tin, biết hợp ở đâu, thiếu ở đâu." },
  { title: "Gợi ý tối ưu", detail: "Kỹ năng nên học thêm, chỗ nên sửa trong hồ sơ." },
  { title: "CV và thư xin việc theo từng tin", detail: "Viết lại CV cho đúng tin bạn muốn ứng tuyển." },
];

/** Tổng quan cho tài khoản chưa có lần chấm AI nào: các bước bắt đầu, việc mới trong ngành, số liệu ngành. */
export function FirstRun() {
  const { user } = useSession();
  const { data } = useDashboard();
  const jobs = useApiQuery(
    keys.jobList({ scored: true, limit: 4 }),
    () => jobsService.list({ scored: true, limit: 4 }),
    { errorMessage: "Không tải được việc làm trong ngành của bạn" },
  );
  if (!data) return null;

  const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";
  const hasProfile = data.profileCompletion > 0;
  const steps: Step[] = [
    { title: "Chọn ngành nghề", detail: data.market?.occupationName ?? "Đã chọn", done: true },
    {
      title: "Tải CV lên",
      detail: "Tự đọc kinh nghiệm, kỹ năng từ file PDF.",
      done: hasProfile,
      action: { label: "Tải CV lên", href: "/dashboard/profile/upload" },
    },
    {
      title: "Chấm điểm một tin",
      detail: "Mở một tin bên dưới và bấm chấm điểm.",
      done: false,
      action: { label: "Xem việc làm", href: "/dashboard/jobs?scored=1" },
    },
  ];
  const current = steps.findIndex((step) => !step.done);

  return (
    <>
      <Card className="p-6 sm:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Chào {firstName}, đây là việc làm {data.market?.occupationName ?? "trong ngành"} cho bạn
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          {hasProfile
            ? "Hồ sơ đã có. Chấm điểm một tin để thấy hệ thống so sánh thế nào."
            : "Bạn đã chọn ngành, xem được việc ngay. Tải CV lên để mỗi tin có điểm phù hợp và lý do vì sao hợp."}
        </p>
        <ol className="mt-6 grid gap-x-10 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                className={cn(
                  "flex size-5.5 shrink-0 items-center justify-center rounded-full text-2xs font-semibold",
                  step.done
                    ? "bg-slate-900 text-white"
                    : index === current
                      ? "border border-slate-900 text-slate-900"
                      : "border border-slate-300 text-slate-400",
                )}
              >
                {step.done ? <Check className="size-3" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", step.done || index === current ? "text-slate-900" : "text-slate-400")}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-500">{step.detail}</p>
                {step.action && index === current && (
                  <Link href={step.action.href} className="mt-2 inline-block">
                    <Button size="sm">{step.action.label}</Button>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
      <DashSection
        title="Việc mới hợp với bạn"
        action={
          <Link href="/dashboard/jobs?scored=1" className="text-xs text-slate-500 hover:text-slate-900">
            Xem tất cả →
          </Link>
        }
      >
        {jobs.data && jobs.data.items.length > 0 ? (
          <ul>
            {jobs.data.items.map((item) => {
              const job = toJobCardFromRecord(item);
              const fit = job.systemMatch && job.systemMatch.total > 0 ? job.systemMatch : null;
              return (
                <JobRow
                  key={job.id}
                  job={job}
                  score={null}
                  meta={[job.company, job.location, job.postedAt.label].filter(Boolean).join(" · ")}
                  note={fit ? `Khớp kỹ năng ${fit.met}/${fit.total}` : null}
                  actionLabel="Chấm điểm AI"
                />
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">{jobs.data ? "Chưa có tin nào trong ngành của bạn." : "Đang tải việc làm…"}</p>
        )}
      </DashSection>
      </Card>

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <Card>
          <MarketCard />
        </Card>
        <Card>
        <DashSection title={hasProfile ? "Chấm điểm một tin để mở khoá" : "Tải CV lên để mở khoá"}>
          <ul>
            {BENEFITS.map((item) => (
              <li key={item.title} className="border-t border-slate-100 py-2.5 first:border-t-0 first:pt-0">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </li>
            ))}
          </ul>
          <Link href={hasProfile ? "/dashboard/jobs?scored=1" : "/dashboard/profile/upload"} className="mt-4 inline-block">
            <Button>{hasProfile ? "Chọn một tin để chấm" : "Tải CV lên"}</Button>
          </Link>
        </DashSection>
        </Card>
      </div>

      <SkillResources placement="dashboard" occupation={data.occupationCode} />
    </>
  );
}
