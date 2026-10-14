"use client";

import { ArrowsClockwise, Sparkle } from "@phosphor-icons/react/ssr";
import { useLearning } from "@/hooks/use-learning";
import { useUpskillReport } from "@/hooks/use-upskill-report";
import { GAP_CATEGORY_LABELS, parseSynthesisedGaps } from "@/lib/upskill-content";
import { formatDate } from "@/utils";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UpskillProgress } from "./upskill-progress";

/** Khoảng trống không lộ ra qua danh sách kỹ năng — phần DUY NHẤT của trang còn do AI viết, chỉ chạy khi người dùng bấm. */
export function SoftGaps() {
  const { report, loaded, error, generating, step, generate } = useUpskillReport();
  const { data: learning } = useLearning();
  const gaps = report ? parseSynthesisedGaps(report.synthesisedGaps) : [];
  const stale =
    !!report?.generatedAt &&
    !!learning?.profileUpdatedAt &&
    new Date(learning.profileUpdatedAt) > new Date(report.generatedAt);

  return (
    <Card className="space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-semibold text-slate-900">Khoảng trống khác</h2>
        {report?.generatedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-primary-800">
            <Sparkle className="size-3.5" />
            AI viết · {formatDate(report.generatedAt)}
          </span>
        )}
        {loaded && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            loading={generating}
            onClick={() => void generate()}
          >
            {!generating && <ArrowsClockwise className="size-4" />}
            {report ? "Phân tích lại" : "Phân tích bằng AI"}
          </Button>
        )}
      </div>
      <p className="text-sm text-slate-500">
        Kiến thức ngành, cách làm việc, công cụ hay chứng chỉ mà danh sách kỹ năng không thể hiện. Mang
        tính gợi ý — đọc tham khảo.
      </p>

      {error && <Alert tone="danger">{error}</Alert>}
      {stale && !generating && (
        <Alert tone="warning">
          Hồ sơ của bạn đã đổi sau lần phân tích này, nội dung bên dưới có thể đã cũ.
        </Alert>
      )}
      {generating && report && <UpskillProgress report={report} step={step} />}

      {gaps.length > 0 ? (
        <div className="space-y-3">
          {gaps.map((gap, index) => (
            <div key={index} className="border-l-2 border-slate-100 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                {gap.category && <Badge variant="outline">{GAP_CATEGORY_LABELS[gap.category]}</Badge>}
                <p className="text-sm font-medium text-slate-900">{gap.gap}</p>
              </div>
              {gap.why && <p className="mt-1 text-xs leading-relaxed text-slate-500">{gap.why}</p>}
            </div>
          ))}
        </div>
      ) : (
        loaded &&
        !generating && (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
            Chưa có phân tích nào. Bấm <strong>Phân tích bằng AI</strong> — mất khoảng 3–4 phút, cần ít
            nhất 3 việc đã chấm điểm bằng AI.
          </p>
        )
      )}
    </Card>
  );
}
