import { ArrowsClockwise } from "@phosphor-icons/react/ssr";
import type { JobReposts } from "@/types";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { postedWeeks } from "@/lib/date";

/** Vị trí này được đăng lại nhiều lần: số lần, các tuần có đăng trong 90 ngày và câu nên hỏi khi phỏng vấn. */
export function RepostCard({ reposts }: { reposts: JobReposts }) {
  const weeks = postedWeeks(reposts.dates, new Date());

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <ArrowsClockwise className="size-5 text-amber-600" weight="duotone" />
        Vị trí này được đăng lại nhiều lần
      </h2>
      <p className="mt-1 text-sm text-slate-700">
        <b>{reposts.count} lần</b> đăng tuyển từ {formatDate(reposts.firstAt)}
      </p>

      <div className="mt-3 flex h-14 items-end gap-1" aria-hidden>
        {weeks.map((posted, index) => (
          <span
            key={index}
            className={cn(
              "flex-1 rounded-t",
              posted ? "h-full bg-amber-500" : "h-1/3 bg-slate-100",
            )}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-2xs text-slate-400">
        <span>90 ngày trước</span>
        <span>Hôm nay</span>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Có thể do mở rộng đội, khó tuyển, hoặc người làm vị trí này nghỉ nhiều.
        Nên hỏi khi phỏng vấn:
      </p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>Vị trí này mở ra do mở rộng hay thay người?</li>
        <li>Người làm vị trí này trước đây ở lại bao lâu?</li>
      </ul>
    </section>
  );
}
