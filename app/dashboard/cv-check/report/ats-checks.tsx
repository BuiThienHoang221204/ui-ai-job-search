import { Card } from "@/components/ui/card";
import { ATS_CHECK_LABELS } from "@/lib/cv-check";
import type { CvReview } from "@/types";
import { StatusIcon } from "./status-icon";

const ATS_ORDER = { fail: 0, warn: 1, pass: 2 };

/** Những điểm máy lọc hay vấp khi đọc file: bố cục đo từ PDF (nếu có) rồi tới phần AI xét trên chữ, lỗi xếp trước. */
export function AtsChecks({
  ats,
  multiColumn,
}: {
  ats: CvReview["ats"];
  multiColumn: boolean | null;
}) {
  const items = ats
    .filter((item) => multiColumn === null || item.key !== "readingOrder")
    .sort((a, b) => ATS_ORDER[a.status] - ATS_ORDER[b.status]);
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        Máy lọc đọc file thế nào
      </h3>
      <ul className="mt-2">
        {multiColumn !== null && (
          <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 py-2.5">
            <StatusIcon status={multiColumn ? "fail" : "pass"} />
            <div className="text-sm">
              <p className="font-medium text-slate-900">
                Bố cục một cột
                <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-semibold text-slate-500">
                  đo từ file PDF
                </span>
              </p>
              {multiColumn && (
                <p className="text-xs text-slate-500">
                  CV chia nhiều cột hoặc kẻ bảng. Nhiều ATS đọc ngang qua các
                  cột nên chữ hai bên bị trộn vào nhau; chuyển sang bố cục một
                  cột cho chắc.
                </p>
              )}
            </div>
          </li>
        )}
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
