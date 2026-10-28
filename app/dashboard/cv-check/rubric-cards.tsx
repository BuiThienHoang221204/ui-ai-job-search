import { Card } from "@/components/ui/card";
import { CV_RUBRIC } from "@/lib/cv-check";

/** 8 tiêu chí chấm CV xếp thành 3 thẻ theo nhóm, hiện trước khi người dùng chọn CV. */
export function RubricCards() {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          Chấm theo 8 tiêu chí, tổng 100 điểm
        </h2>
        <p className="text-xs text-slate-500">
          Không có điểm ATS chung — mỗi nhóm ghi rõ ai là người đọc
        </p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {CV_RUBRIC.map((group) => (
          <Card key={group.key} className="p-4">
            <div className="flex items-baseline justify-between border-b border-slate-200 pb-2.5">
              <p className="font-semibold text-slate-900">
                {group.label}
                <span className="ml-1.5 text-xs font-normal text-slate-500">
                  {group.reader}
                </span>
              </p>
              <span className="text-primary-600 font-mono text-xs font-semibold">
                {group.points}
              </span>
            </div>
            <ul>
              {group.items.map((item) => (
                <li
                  key={item.key}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 border-b border-slate-100 py-2.5 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="font-medium text-slate-900">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {item.points}
                  </span>
                  <span className="col-span-2 mt-0.5 text-xs text-slate-500">
                    {item.note}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
