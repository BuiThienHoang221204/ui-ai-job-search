"use client";

import Link from "next/link";
import { CaretRight, Microphone } from "@phosphor-icons/react/ssr";
import { mockInterviewService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { InterviewStatusBadge } from "@/components/dashboard/interview-status-badge";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeDay } from "@/utils";

const PAGE_SIZE = 8;

/** Danh sách các buổi phỏng vấn thử gần nhất của mọi vị trí. */
export function MockSessions() {
  const page = useApiQuery(
    keys.mockInterviewList({ workflow: "interview", limit: PAGE_SIZE }),
    () => mockInterviewService.list({ workflow: "interview", limit: PAGE_SIZE }),
    { errorMessage: "Không tải được danh sách buổi luyện" },
  );

  if (page.error || (page.data && page.data.items.length === 0)) return null;

  return (
    <SectionCard
      icon={Microphone}
      title="Buổi phỏng vấn thử đã có"
      description="Mở lại để đọc nhận xét, hoặc luyện tiếp từ chỗ đang dở"
      className="mb-4"
      contentClassName="space-y-0"
    >
      {!page.data ? (
        <Skeleton className="h-20" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {page.data.items.map((session) => {
            const label = session.job
              ? `${session.job.title} · ${session.job.company}`
              : session.jobId
                ? "Tin tuyển dụng đã bị gỡ"
                : "Buổi luyện từ mô tả dán tay";

            const row = (
              <div className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      {session._count.steps}
                    </span>{" "}
                    bước · {relativeDay(session.createdAt)}
                  </p>
                </div>
                <InterviewStatusBadge status={session.status} />
                {session.jobId && (
                  <CaretRight className="size-4.5 shrink-0 text-slate-300" />
                )}
              </div>
            );

            return (
              <li key={session.id}>
                {session.jobId ? (
                  <Link
                    href={`/dashboard/interview/${session.jobId}/mock`}
                    className="hover:bg-slate-50/80 -mx-2 block rounded-md px-2 transition-colors"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="-mx-2 px-2 opacity-60">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
