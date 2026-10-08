import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { DashboardOverview } from "@/types";
import { toJobCard } from "@/lib/adapters";
import { JobCard } from "@/components/dashboard/job-card";
import { EmptyHint } from "@/components/ui/empty-state";

const GRID =
  "grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,18.75rem),1fr))] md:grid-rows-[auto] md:auto-rows-[0] md:gap-y-0 md:overflow-hidden";

/** 4 tin chấm bằng AI gần nhất; từ tablet trở lên chỉ hiện đúng một hàng. */
export function TopMatches({
  matches,
}: {
  matches: DashboardOverview["topMatches"];
}) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            Đã chấm bằng AI gần đây
          </h2>
          <p className="text-xs text-slate-500">
            Những tin bạn chấm điểm gần nhất, đã loại tin không đủ điều kiện
            ứng tuyển
          </p>
        </div>
        <Link
          href="/dashboard/matches"
          className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
        >
          Xem tất cả tin đã chấm <ArrowRight className="size-4" />
        </Link>
      </div>

      {matches.length > 0 ? (
        <div className={GRID}>
          {matches.map((match) => (
            <JobCard key={match.jobId} job={toJobCard(match)} />
          ))}
        </div>
      ) : (
        <EmptyHint>Chưa có công việc nào được chấm điểm.</EmptyHint>
      )}
    </section>
  );
}
