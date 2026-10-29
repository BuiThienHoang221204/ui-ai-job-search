"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { BookOpenText, Plus, Sparkle } from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useSelectedJob } from "@/hooks/use-interview-prep";
import { useSyncedSticky } from "@/hooks/use-synced-sticky";
import { keys } from "@/lib/query-keys";
import { interviewService } from "@/services";
import { PageHeader } from "@/components/ui/page-header";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPositionModal } from "./add-position-modal";
import { PrepDetail, STATUS_LABEL, STATUS_VARIANT } from "./prep-detail";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { isPrepBusy } from "@/lib/interview-status";
import type { InterviewPrepSummary } from "@/types";

const PAGE_SIZE = 15;
const POLL_MS = 2500;
const SLOW_AFTER_MS = 3 * 60 * 1000;

/** Chip trạng thái của một dòng: bộ đề chưa xong thì chỉ báo trạng thái, xong thì báo tiến độ luyện và lịch phỏng vấn. */
function PositionChips({ prep }: { prep: InterviewPrepSummary }) {
  if (prep.status !== "DONE") {
    return (
      <Badge variant={STATUS_VARIANT[prep.status]}>
        {STATUS_LABEL[prep.status]}
      </Badge>
    );
  }
  return (
    <>
      {prep.practiced > 0 ? (
        <Badge variant="primary">
          Luyện {prep.practiced}/{prep.total}
        </Badge>
      ) : (
        <Badge variant="neutral">Chưa luyện</Badge>
      )}
      {prep.application?.interviewAt && (
        <Badge variant="outline">
          PV {formatDate(prep.application.interviewAt)}
        </Badge>
      )}
      {prep.mockCount > 0 && (
        <Badge variant="outline">Thử {prep.mockCount} buổi</Badge>
      )}
    </>
  );
}

/** Màn chuẩn bị phỏng vấn: một danh sách vị trí bên trái, bộ câu hỏi bên phải. */
export function InterviewView() {
  const [offset, setOffset] = useState(0);
  const [adding, setAdding] = useState(false);
  const [chosen, select] = useSelectedJob();
  const [attachPanel, attachContainer] = useSyncedSticky();

  const page = useApiQuery(
    keys.interviewList(offset),
    () => interviewService.list({ limit: PAGE_SIZE, offset }),
    {
      errorMessage: "Không tải được bộ câu hỏi phỏng vấn",
      keepPrevious: true,
      refetchInterval: (data) =>
        data?.items.some((prep) => isPrepBusy(prep.status)) ? POLL_MS : false,
    },
  );

  const preps = page.data?.items ?? null;
  const runToken =
    preps
      ?.filter((prep) => isPrepBusy(prep.status))
      .map((prep) => prep.id)
      .join() ?? "";
  const slow =
    useDebounce(runToken, SLOW_AFTER_MS) === runToken && runToken !== "";

  const selectedJobId =
    chosen ??
    (preps?.find((prep) => prep.status === "DONE") ?? preps?.[0])?.jobId ??
    null;

  let content: ReactNode;
  if (page.error) {
    content = <Alert tone="danger">{page.error}</Alert>;
  } else if (!preps) {
    content = <Skeleton className="h-64 animate-pulse" />;
  } else if (preps.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={Sparkle}
          title="Chưa có vị trí nào để chuẩn bị"
          description="Chọn một đơn đã nộp hoặc một tin đã lưu, hệ thống sẽ soạn bộ câu hỏi riêng cho vị trí đó. Mỗi lượt soạn tốn một lần gọi model nên hệ thống không soạn sẵn cho mọi tin."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus className="size-4.5" />
              Thêm vị trí
            </Button>
          }
        />
      </Card>
    );
  } else {
    content = (
      <div
        ref={attachContainer}
        className="grid grid-cols-1 gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]"
      >
        <div ref={attachPanel} className="h-fit lg:sticky">
          <Card className="overflow-hidden">
            <div className="flex items-baseline justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                Vị trí đang chuẩn bị
              </p>
              <p className="text-xs text-slate-400">
                {page.data?.total ?? 0} vị trí
              </p>
            </div>
            <ul className="divide-y divide-slate-100">
              {preps.map((prep) => {
                const active = prep.jobId === selectedJobId;
                const percent = prep.total
                  ? Math.round((prep.practiced / prep.total) * 100)
                  : 0;
                return (
                  <li key={prep.id}>
                    <button
                      type="button"
                      onClick={() => select(prep.jobId)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors",
                        active ? "bg-primary-50" : "hover:bg-slate-50",
                      )}
                    >
                      <CompanyLogo
                        src={prep.job.companyLogo}
                        size="sm"
                        className="size-10 text-xs"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {prep.job.title}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {prep.job.company}
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-1">
                          <PositionChips prep={prep} />
                        </span>
                        {prep.status === "DONE" && prep.total > 0 && (
                          <Progress value={percent} className="mt-2 h-1" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Pagination
              offset={offset}
              limit={PAGE_SIZE}
              total={page.data?.total ?? 0}
              noun="vị trí"
              onOffsetChange={setOffset}
            />
          </Card>
        </div>

        <div className="min-w-0">
          {selectedJobId && (
            <PrepDetail key={selectedJobId} jobId={selectedJobId} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chuẩn bị phỏng vấn"
        subtitle="Bộ câu hỏi soạn riêng cho từng vị trí, tự trả lời trước rồi mới xem gợi ý"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/interview/questions">
              <Button variant="outline">
                <BookOpenText className="size-4.5" />
                Ngân hàng câu hỏi
              </Button>
            </Link>
            <Button onClick={() => setAdding(true)}>
              <Plus className="size-4.5" />
              Thêm vị trí
            </Button>
          </div>
        }
      />

      <AddPositionModal open={adding} onClose={() => setAdding(false)} />

      {slow && (
        <Alert tone="warning" title="Lâu hơn thường lệ">
          Một bộ câu hỏi đã chạy quá ba phút. Thường chỉ mất khoảng một phút —
          có thể hàng đợi model đang bận. Bạn cứ để đó, hoặc soạn lại nếu nó
          chuyển sang lỗi.
        </Alert>
      )}

      {content}
    </div>
  );
}
