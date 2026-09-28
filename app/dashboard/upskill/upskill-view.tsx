"use client";

import { streamModel } from "@/lib/model-stream";
import { UpskillProgress, type UpskillPartial } from "./upskill-progress";
import { ReportBody } from "./report-body";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowsClockwise, GraduationCap } from "@phosphor-icons/react/ssr";
import { failureMessage } from "@/lib/failure-message";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { upskillService, type UpskillReportRecord } from "@/services";

import { formatDate } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import { Skeleton } from "@/components/ui/skeleton";

const LOGIN_NEXT = "/login?next=/dashboard/upskill";

const LATEST_KEY = ["upskill", "latest"];

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 80;

/** Màn nâng cấp kỹ năng: tải, tạo báo cáo và hỏi lại tới khi xong. */
export function  UpskillView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (apiErrorStatus(err) !== 401) return false;
      router.replace(LOGIN_NEXT);
      return true;
    },
    [router],
  );

  const query = useApiQuery(
    LATEST_KEY,
    () =>
      upskillService.latest().catch((err: unknown) => {
        if (apiErrorStatus(err) === 404) return null;
        throw err;
      }),
    { errorMessage: "Không tải được báo cáo" },
  );

  const report = query.data;
  const loaded = report !== null || !query.loading;

  /** Thay cho `setReport`: vòng hỏi lại ghi thẳng kết quả vào cache. */
  const putReport = useCallback(
    (next: UpskillReportRecord) => queryClient.setQueryData(LATEST_KEY, next),
    [queryClient],
  );

  const generate = async () => {
    setGenerating(true);
    setRefusal(null);
    setError(null);
    setStep(0);

    try {
      const done = await streamModel<UpskillReportRecord, UpskillPartial>({
        path: "/upskill/generate-stream",
        onPartial: (partial) => {
          if (mounted.current && typeof partial.step === "number")
            setStep(partial.step);
        },
      });
      if (!mounted.current) return;
      putReport(done);
      setGenerating(false);
      return;
    } catch {
    }

    let reportId: string;
    try {
      const receipt = await upskillService.generate();
      reportId = receipt.reportId;
    } catch (err) {
      setGenerating(false);
      if (handleUnauthorized(err)) return;
      if (apiErrorStatus(err) === 400) {
        setRefusal(apiErrorMessage(err, "Chưa đủ dữ liệu để tổng hợp"));
        return;
      }
      setError(apiErrorMessage(err, "Không tạo được báo cáo"));
      return;
    }

    let polls = 0;
    const read = async () => {
      if (!mounted.current) return;
      try {
        const current = await upskillService.get(reportId);
        if (!mounted.current) return;

        if (current.status === "DONE" || current.status === "FAILED") {
          putReport(current);
          setGenerating(false);
          if (current.status === "FAILED") {
            setError(failureMessage(current.failureKind));
          }
          return;
        }

        polls += 1;
        if (polls >= MAX_POLLS) {
          setGenerating(false);
          setError(
            "Báo cáo chạy quá lâu. Nó vẫn đang trong hàng đợi; tải lại trang sau ít phút.",
          );
          return;
        }
        setTimeout(() => void read(), POLL_INTERVAL_MS);
      } catch (err) {
        if (!mounted.current) return;
        setGenerating(false);
        if (handleUnauthorized(err)) return;
        setError(apiErrorMessage(err, "Không đọc được trạng thái báo cáo"));
      }
    };

    void read();
  };

  const actions = (
    <Button onClick={() => void generate()} loading={generating}>
      <ArrowsClockwise className="size-4.5" />
      {report ? "Tạo lại" : "Tạo báo cáo"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lộ trình học"
        subtitle="Tổng hợp kỹ năng còn thiếu trên toàn bộ việc làm đã chấm điểm, rồi xếp thành thứ tự học"
        actions={loaded ? actions : undefined}
      />

      {refusal && <Alert tone="warning">{refusal}</Alert>}
      {(error ?? query.error) && (
        <Alert tone="danger">{error ?? query.error}</Alert>
      )}

      {!loaded ? (
        <Skeleton className="h-64 animate-pulse" />
      ) : !report ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Chưa có báo cáo nào"
            description={
              <>
                Báo cáo tổng hợp khoảng trống kỹ năng từ những việc làm đã được
                chấm điểm — cần <strong>ít nhất 3 việc</strong> để con số có ý
                nghĩa. Chấm thêm việc ở màn Việc làm rồi quay lại đây.
              </>
            }
            action={
              <Link href="/dashboard/jobs/all">
                <Button variant="secondary">Mở danh sách việc làm</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant="neutral">
              {report.mode === "AGGREGATE" ? "Tổng hợp" : "Một vị trí"}
            </Badge>
            <span className="font-mono">
              dựa trên {report.jobsAnalysed} việc đã chấm
            </span>
            {report.generatedAt && (
              <span>· {formatDate(report.generatedAt)}</span>
            )}
          </div>

          {generating ? (
            <UpskillProgress report={report} step={step} />
          ) : null}

          <ReportBody report={report} />
        </div>
      )}
    </div>
  );
}
