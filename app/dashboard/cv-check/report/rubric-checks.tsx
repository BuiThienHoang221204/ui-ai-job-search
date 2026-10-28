import { Card } from "@/components/ui/card";
import { statusOf } from "@/lib/cv-check";
import type { CvCheckResult } from "@/types";
import { StatusIcon } from "./status-icon";

/** Điểm từng tiêu chí sau khi chấm, kèm lý do ở tiêu chí chưa đủ điểm. */
export function RubricChecks({ result }: { result: CvCheckResult }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        Bảng chấm 8 tiêu chí
      </h3>
      <ul className="mt-2">
        {result.checks.map((check) => (
          <li
            key={check.key}
            className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] gap-2 border-t border-slate-200 py-2.5 first:border-t-0"
          >
            <StatusIcon status={statusOf(check.earned, check.max)} />
            <div className="text-sm">
              <p className="font-medium text-slate-900">{check.label}</p>
              {check.earned < check.max && (
                <p className="text-xs text-slate-500">{check.detail}</p>
              )}
            </div>
            <span className="font-mono text-xs text-slate-500">
              {check.earned}/{check.max}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
