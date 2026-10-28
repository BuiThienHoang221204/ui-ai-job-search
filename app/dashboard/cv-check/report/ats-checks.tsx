import { Card } from "@/components/ui/card";
import { ATS_CHECK_LABELS } from "@/lib/cv-check";
import type { CvReview } from "@/types";
import { StatusIcon } from "./status-icon";

const ATS_ORDER = { fail: 0, warn: 1, pass: 2 };

/** Năm điểm máy lọc hồ sơ hay vấp, theo AI, lỗi xếp trước. */
export function AtsChecks({ ats }: { ats: CvReview["ats"] }) {
  const items = [...ats].sort(
    (a, b) => ATS_ORDER[a.status] - ATS_ORDER[b.status],
  );
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        AI xét trên chữ trích ra từ file
      </h3>
      <ul className="mt-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 border-t border-slate-200 py-2.5 first:border-t-0"
          >
            <StatusIcon status={item.status} />
            <div className="text-sm">
              <p className="font-medium text-slate-900">
                {ATS_CHECK_LABELS[item.key]}
              </p>
              {item.status !== "pass" && (
                <p className="text-xs text-slate-500">{item.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
