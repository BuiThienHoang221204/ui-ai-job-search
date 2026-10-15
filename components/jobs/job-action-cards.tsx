import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PaperPlaneTilt } from "@phosphor-icons/react/ssr";
import type { JobActionKey } from "@/types";

const ACTIONS = {
  cv: {
    href: (jobId: string) => `/dashboard/cv-optimizer?jobId=${jobId}`,
    title: "Tối ưu CV cho tin này",
    hint: "Thêm từ khoá còn thiếu, nhấn mạnh điểm mạnh",
    imageSrc: "/icons/cv-optimize.png",
  },
  letter: {
    href: (jobId: string) => `/dashboard/cover-letter?jobId=${jobId}`,
    title: "Thư xin việc",
    hint: "Thư và email gửi nhà tuyển dụng",
    imageSrc: "/icons/letter-mail.png",
  },
  interview: {
    href: (jobId: string) => `/dashboard/interview/${jobId}/mock`,
    title: "Luyện phỏng vấn",
    hint: "Câu hỏi sát với tin này",
    imageSrc: "/icons/interview-mic.png",
  },
  apply: {
    href: (jobId: string) => `/dashboard/jobs/${jobId}`,
    title: "Ứng tuyển",
    hint: "Mở tin, ứng tuyển và lưu vào lịch sử",
    imageSrc: null,
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
        return (
          <Link
            key={key}
            href={action.href(jobId)}
            className="group grid grid-cols-[2.5rem_minmax(0,1fr)_1.125rem] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition hover:-translate-y-px hover:border-primary-200 hover:shadow-md hover:shadow-primary-600/5"
          >
            <span className="flex size-10 items-center justify-center">
              {action.imageSrc ? (
                <Image
                  src={action.imageSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 object-contain"
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <PaperPlaneTilt className="size-5" />
                </span>
              )}
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
