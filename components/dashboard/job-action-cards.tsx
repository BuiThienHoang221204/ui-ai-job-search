import Link from "next/link";
import {
  ArrowRight,
  Envelope,
  FileText,
  Microphone,
  PaperPlaneTilt,
} from "@phosphor-icons/react/ssr";
import type { JobActionKey } from "@/types";
import { cn } from "@/utils";

const ACTIONS = {
  cv: {
    href: (jobId: string) => `/dashboard/cv-optimizer?jobId=${jobId}`,
    title: "Tối ưu CV cho tin này",
    hint: "Thêm từ khoá còn thiếu, nhấn mạnh điểm mạnh",
    icon: FileText,
    iconClassName: "bg-primary-50 text-primary-600",
  },
  letter: {
    href: (jobId: string) => `/dashboard/cover-letter?jobId=${jobId}`,
    title: "Thư xin việc",
    hint: "Thư và email gửi nhà tuyển dụng",
    icon: Envelope,
    iconClassName: "bg-cyan-50 text-cyan-700",
  },
  interview: {
    href: (jobId: string) => `/dashboard/interview/${jobId}/mock`,
    title: "Luyện phỏng vấn",
    hint: "Câu hỏi sát với tin này",
    icon: Microphone,
    iconClassName: "bg-fuchsia-50 text-fuchsia-700",
  },
  apply: {
    href: (jobId: string) => `/dashboard/jobs/${jobId}`,
    title: "Ứng tuyển",
    hint: "Mở tin, ứng tuyển và lưu vào lịch sử",
    icon: PaperPlaneTilt,
    iconClassName: "bg-primary-50 text-primary-600",
  },
} as const;

/** Các thẻ việc làm tiếp với một tin (tối ưu CV, thư, phỏng vấn, ứng tuyển), dùng chung cho mọi trang. */
export function JobActionCards({
  jobId,
  actions,
  id,
}: {
  jobId: string;
  actions: JobActionKey[];
  id?: string;
}) {
  return (
    <div id={id} className="grid scroll-mt-20 gap-3 md:grid-cols-3">
      {actions.map((key) => {
        const action = ACTIONS[key];
        const Icon = action.icon;
        return (
          <Link
            key={key}
            href={action.href(jobId)}
            className="group grid grid-cols-[2.5rem_minmax(0,1fr)_1.125rem] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-px hover:border-primary-200 hover:shadow-md hover:shadow-primary-600/5"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                action.iconClassName,
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">
                {action.title}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {action.hint}
              </span>
            </span>
            <ArrowRight className="size-4.5 text-slate-400 group-hover:text-primary-600" />
          </Link>
        );
      })}
    </div>
  );
}
