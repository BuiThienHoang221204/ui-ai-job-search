import { Card } from "@/components/ui/card";
import { FIX_HINTS } from "@/lib/cv-check";
import type { CvCheckItem } from "@/types";

/** Lỗi do code chấm, dùng khi không có nhận xét của AI (hết lượt, AI lỗi). */
export function FlagList({ flags }: { flags: CvCheckItem[] }) {
  return (
    <Card className="mt-3 divide-y divide-slate-200">
      {flags.map((flag, index) => (
        <div key={flag.key} className="px-5 py-4.5">
          <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-2.5">
            <span className="mt-0.5 grid size-5.5 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {index + 1}
            </span>
            <div>
              <h4 className="font-semibold text-slate-900">{flag.label}</h4>
              <p className="mt-1 text-sm text-slate-600">{flag.detail}</p>
              {FIX_HINTS[flag.key] && (
                <p className="mt-1 text-sm text-slate-600">
                  <b className="text-slate-900">Cách sửa:</b>{" "}
                  {FIX_HINTS[flag.key]}
                </p>
              )}
              {flag.sample && (
                <p className="mt-2.5 rounded-r-md border-l-2 border-amber-500 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {flag.sample}
                </p>
              )}
            </div>
            <span className="font-mono text-sm font-semibold text-rose-600">
              −{flag.max - flag.earned}
            </span>
          </div>
        </div>
      ))}
    </Card>
  );
}
