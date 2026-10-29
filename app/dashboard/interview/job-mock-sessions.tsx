"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CaretRight,
  ChatCircleText,
  ChatsCircle,
} from "@phosphor-icons/react/ssr";
import { mockInterviewService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { InterviewStatusBadge } from "./interview-status-badge";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeDay } from "@/lib/date";
import { plainPreview } from "@/lib/text";

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

  let content: ReactNode;
  if (sessions.error) {
    content = <p className="text-sm text-rose-600">{sessions.error}</p>;
  } else if (!items) {
    content = <Skeleton className="h-16" />;
  } else if (items.length === 0) {
    content = (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
        Chưa có buổi phỏng vấn thử nào. Bấm <strong>Phỏng vấn thử</strong> ở
        trên để bắt đầu, hoặc <strong>Luyện câu này</strong> ở một câu hỏi.
      </p>
    );
  } else {
    content = (
      <ul className="space-y-2.5">
        {items.map((session) => {
          const waiting = session.status === "WAITING_USER";
          return (
            <li key={session.id}>
              <Link
                href={`/dashboard/interview/${jobId}/mock?run=${session.id}`}
                className="hover:border-primary-200 hover:bg-primary-50/40 block rounded-xl border border-slate-200/80 p-3.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {relativeDay(session.createdAt)}
                  </span>
                  <InterviewStatusBadge status={session.status} />
                </div>

                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <ChatCircleText className="size-3.5 text-slate-400" />
                  {session._count.steps} lượt hỏi
                </p>

                {session.closing && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">
                      Tổng kết:
                    </span>{" "}
                    {plainPreview(session.closing)}
                  </p>
                )}
                {waiting && session.question && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    <span className="font-medium text-slate-600">
                      Đang chờ bạn trả lời:
                    </span>{" "}
                    {session.question}
                  </p>
                )}

                <p className="text-primary-700 mt-2.5 flex items-center justify-end gap-0.5 text-xs font-semibold">
                  {waiting ? "Tiếp tục" : "Xem lại"}
                  <CaretRight className="size-3.5" />
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <SectionCard
      icon={ChatsCircle}
      title="Buổi phỏng vấn thử của vị trí này"
      description={items ? `${items.length} buổi` : undefined}
    >
      {content}
    </SectionCard>
  );
}
