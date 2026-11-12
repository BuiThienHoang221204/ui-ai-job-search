"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { applicationsService } from "@/services";
import { PaperPlaneTilt } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { DashSection } from "@/components/ui/dash-section";
import { EmptyState } from "@/components/ui/empty-state";
import { useRecentApplications } from "@/hooks/use-recent-applications";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/axios";
import { relativeDay } from "@/lib/date";
import { invalidateAfter } from "@/lib/query-keys";

/** Đơn ứng tuyển: số đơn đã xem chưa nộp và đã nộp, kèm các tin đã xem gần nhất để đánh dấu đã nộp ngay tại đây. */
export function ApplicationsCard() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { viewed, appliedTotal } = useRecentApplications();

  const markApplied = async (id: string) => {
    try {
      await applicationsService.updateStatus(id, "APPLIED");
      invalidateAfter(queryClient, "applicationStatus");
    } catch (err) {
      toast.danger(apiErrorMessage(err, "Chưa đánh dấu được, thử lại sau."));
    }
  };

  const action = (
    <Link href="/dashboard/applications" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
      Lịch sử
    </Link>
  );

  return (
    <DashSection title="Đơn ứng tuyển" action={action} className="flex flex-col">
      <p className="text-sm text-slate-600">
        <b className="font-semibold text-slate-900 tabular-nums">{viewed?.total ?? "—"}</b> đã xem, chưa nộp ·{" "}
        <b className="font-semibold text-slate-900 tabular-nums">{appliedTotal ?? "—"}</b> đã nộp
      </p>
      {viewed && viewed.items.length === 0 && (
        <EmptyState
          icon={PaperPlaneTilt}
          title="Chưa có tin nào đang chờ bạn nộp"
          description="Bấm “Ứng tuyển ngay” ở một tin, Careelot sẽ giữ tin đó ở đây để bạn đánh dấu khi đã nộp."
          className="flex-1 justify-center py-6"
          action={
            <Link href="/dashboard/jobs?scored=1">
              <Button variant="outline" size="sm">Xem việc làm phù hợp</Button>
            </Link>
          }
        />
      )}
      <ul className="mt-2">
        {viewed?.items.map((application) => (
          <li
            key={application.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-2.5 first:border-t-0"
          >
            <Link href={`/dashboard/jobs/${application.jobId}`} className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900 hover:text-primary-600">
                {application.job.title}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {application.job.company} · đã xem {relativeDay(application.createdAt)}
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void markApplied(application.id)}
              className="whitespace-nowrap text-primary-600 hover:text-primary-700"
            >
              Đánh dấu đã nộp
            </Button>
          </li>
        ))}
      </ul>
    </DashSection>
  );
}
