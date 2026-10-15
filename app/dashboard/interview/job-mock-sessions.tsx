"use client";

import Link from "next/link";
import { ChatsCircle } from "@phosphor-icons/react/ssr";
import { mockInterviewService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import {
  InterviewStatusBadge,
} from "./interview-status-badge";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeDay } from "@/lib/date";

const LIMIT = 20;

/** Các buổi phỏng vấn thử của một vị trí, mới nhất trước; bấm vào buổi nào thì mở lại đúng buổi đó. */
export function JobMockSessions({ jobId }: { jobId: string }) {
  const scope = { jobId, workflow: "interview", limit: LIMIT };
  const sessions = useApiQuery(
    keys.mockInterviewList(scope),
    () => mockInterviewService.list(scope),
    { errorMessage: "Không tải được các buổi phỏng vấn thử" },
  );
  const items = sessions.data?.items ?? null;

  return (
    <SectionCard
      icon={ChatsCircle}
      title="Buổi phỏng vấn thử của vị trí này"
      description={items ? `${items.length} buổi` : undefined}
    >
      {sessions.error ? (
        <p className="text-sm text-rose-600">{sessions.error}</p>
      ) : !items ? (
        <Skeleton className="h-16" />
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
          Chưa có buổi phỏng vấn thử nào. Bấm <strong>Phỏng vấn thử</strong> ở
          trên để bắt đầu, hoặc <strong>Luyện câu này</strong> ở một câu hỏi.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((session) => (
            <li key={session.id}>
              <Link
                href={`/dashboard/interview/${jobId}/mock?run=${session.id}`}
                className="block rounded-lg border border-slate-200/80 px-4 py-3 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {relativeDay(session.createdAt)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {session._count.steps} lượt hỏi
                  </span>
                  <InterviewStatusBadge status={session.status} />
                  <span className="ml-auto text-xs font-medium text-primary-700">
                    {session.status === "WAITING_USER" ? "Tiếp tục ›" : "Xem lại ›"}
                  </span>
                </div>
                {session.closing && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                    Tổng kết: {session.closing}
                  </p>
                )}
                {session.status === "WAITING_USER" && session.question && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                    Đang chờ bạn trả lời: {session.question}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
