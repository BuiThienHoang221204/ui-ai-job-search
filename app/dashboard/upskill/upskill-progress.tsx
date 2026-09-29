import { Check, CircleNotch } from "@phosphor-icons/react/ssr";
import { Alert } from "@/components/ui/alert";
import { ModelElapsed } from "@/components/dashboard/model-elapsed";
import type { UpskillReportRecord } from "@/services";

const EXPECTED_SECONDS = 254;

export interface UpskillPartial {
  step?: number;
  value?: unknown;
}

/** Đếm số phần tử nếu là mảng, ngược lại trả 0. */
const count = (value: unknown) => (Array.isArray(value) ? value.length : 0);

/** Một bước trong tiến trình tạo báo cáo. */
function StepRow({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2">
      {done ? (
        <Check className="size-4.5 shrink-0 text-emerald-600" />
      ) : (
        <CircleNotch className="size-4.5 shrink-0 animate-spin text-slate-400" />
      )}
      <span className={done ? "text-slate-800" : "text-slate-500"}>{label}</span>
    </span>
  );
}

/** Tiến trình trực tiếp khi đang tạo báo cáo nâng cấp kỹ năng. */
export function UpskillProgress({
  report,
  step = 0,
}: {
  report: UpskillReportRecord;
  step?: number;
}) {
  const gaps = count(report.hardGaps) + count(report.synthesisedGaps);
  const step1Done = step >= 2 || gaps > 0;

  return (
    <Alert tone="info">
      <ModelElapsed expected={EXPECTED_SECONDS} />
      <StepRow
        done={step1Done}
        label={`Bước 1/2 — tìm khoảng trống kỹ năng${
          step1Done && gaps > 0 ? `: đã tìm ra ${gaps} khoảng trống` : ""
        }`}
      />
      <span className="mt-1 block">
        <StepRow done={false} label="Bước 2/2 — lập lộ trình học" />
      </span>
      <span className="mt-2 block text-xs text-slate-500">
        Nội dung bên dưới vẫn là bản cũ cho tới khi bản mới xong.
      </span>
    </Alert>
  );
}
