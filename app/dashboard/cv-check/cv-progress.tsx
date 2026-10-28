import { Check } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CvCheckPhase, CvCheckSource } from "@/types";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    title: "Đọc chữ trong file",
    note: "Ngay trên máy bạn",
  },
  {
    title: "AI đọc từng mục và nhận xét",
    note: "Tìm câu nên viết lại, kiểm thứ tự chữ, ngày tháng, chính tả",
  },
  {
    title: "Tính điểm 8 tiêu chí",
    note: "Đếm số liệu, động từ, độ dài trên từng dòng",
  },
];

const PAPER_LINES = [
  "h-2 w-3/5 bg-slate-200",
  "w-2/5",
  "bg-primary-200 mt-3 w-1/3",
  "w-full",
  "w-11/12",
  "w-3/4",
  "bg-primary-200 mt-3 w-1/3",
  "w-full",
  "w-4/5",
  "bg-primary-200 mt-3 w-1/3",
  "w-3/5",
];

/** Màn chờ phân tích: trang CV đang quét, các bước, một mẹo viết CV và khung xương của báo cáo sắp hiện. */
export function CvProgress({
  source,
  phase,
}: {
  source: CvCheckSource | null;
  phase: CvCheckPhase;
}) {
  const current = phase === "reading" ? 0 : 1;

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <div className="grid items-start gap-7 p-6 sm:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_17.5rem]">
          <div className="relative hidden aspect-[1/1.414] w-33 overflow-hidden rounded-md border border-slate-300 bg-white px-3 py-3.5 shadow-[0_16px_30px_-20px_rgba(15,23,42,0.45)] sm:block">
            {PAPER_LINES.map((line, index) => (
              <i
                key={index}
                className={cn("mb-1.5 block h-1 rounded-xs bg-slate-100", line)}
              />
            ))}
            <span className="animate-scan to-primary-500/20 border-primary-500 absolute inset-x-0 h-9 border-b-2 bg-linear-to-b from-transparent" />
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-3xs font-extrabold text-rose-600">
                {source?.file ? "PDF" : "CHỮ"}
              </span>
              <span className="truncate">{source?.name}</span>
              {source?.pages && (
                <span className="font-normal text-slate-500">
                  · {source.pages} trang
                </span>
              )}
            </p>
            <h2 className="font-display mt-2.5 text-[1.375rem] text-slate-900">
              Đang đọc CV của bạn…
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Thường mất 10–30 giây. Đừng đóng trang, kết quả hiện ngay tại đây.
            </p>
            <ol className="relative mt-4.5 grid gap-3.5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-0.5 before:bg-slate-200">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3"
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border-2 border-slate-300 bg-white",
                      index < current &&
                        "border-emerald-600 bg-emerald-600 text-white",
                      index === current && "border-primary-600",
                    )}
                  >
                    {index < current && (
                      <Check weight="bold" className="size-3" />
                    )}
                    {index === current && (
                      <span className="border-t-primary-600 size-3 animate-spin rounded-full border-2 border-slate-300" />
                    )}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold text-slate-900",
                        index > current && "font-medium text-slate-500",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500">{step.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="border-primary-100 bg-primary-50 rounded-xl border p-4 sm:col-span-2 xl:col-span-1">
            <p className="text-primary-700 text-xs font-semibold">
              Trong lúc chờ
            </p>
            <p className="mt-1.5 font-semibold text-slate-900">
              Một dòng kinh nghiệm mạnh có đủ ba phần
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <b className="text-slate-900">Làm gì</b> ·{" "}
              <b className="text-slate-900">bằng gì</b> ·{" "}
              <b className="text-slate-900">kết quả ra sao</b>.
            </p>
            <p className="border-primary-200 mt-3 border-t border-dashed pt-3 text-sm text-slate-900">
              <s className="text-slate-500">Tham gia tối ưu hệ thống</s>
              <br />
              Tối ưu truy vấn PostgreSQL, giảm thời gian phản hồi{" "}
              <span className="rounded border border-dashed border-amber-500 px-1 font-mono text-xs font-bold text-amber-600">
                [__]
              </span>
              %
            </p>
          </aside>
        </div>
        <div className="grid animate-pulse border-t border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2 px-6 py-4">
              <Skeleton className="h-2.5 w-1/2" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid animate-pulse gap-3 md:grid-cols-2">
        {[0, 1].map((index) => (
          <Card key={index} className="space-y-2.5 p-5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-11/12" />
            <Skeleton className="h-2.5 w-2/3" />
          </Card>
        ))}
      </div>
    </div>
  );
}
