"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Bookmark, BookmarkSimple, Compass, Sparkle } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { Job, ShortlistView } from "@/types";
import { jobsService } from "@/services";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { Button } from "@/components/ui/button";
import { DashSection } from "@/components/ui/dash-section";
import { EmptyState } from "@/components/ui/empty-state";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { toJobCard, toJobCardFromRecord } from "@/lib/adapters";
import { useDashboard } from "@/hooks/use-dashboard";
import { useJobShortlist } from "@/hooks/use-job-shortlist";
import { cn } from "@/lib/cn";
import { afterSaveJob } from "@/lib/job-cache";
import { displayLocation } from "@/lib/location";
import { matchTone, type ScoreTone } from "@/lib/score";

type Tab = "best" | ShortlistView;

const TABS: { value: Tab; label: string; href: string }[] = [
  { value: "best", label: "Phù hợp nhất", href: "/dashboard/matches" },
  { value: "newest", label: "Mới nhất", href: "/dashboard/jobs?scored=1" },
  { value: "saved", label: "Đã lưu", href: "/dashboard/jobs?saved=1" },
];

const EMPTY: Record<Tab, { icon: Icon; title: string; description: string; action: string; href: string }> = {
  best: {
    icon: Sparkle,
    title: "Chưa có tin nào đang chờ",
    description: "Tin bạn đã chấm điểm mà chưa nộp đơn sẽ hiện ở đây. Mở một tin phù hợp và bấm chấm điểm để bắt đầu.",
    action: "Xem việc làm phù hợp",
    href: "/dashboard/jobs?scored=1",
  },
  newest: {
    icon: Compass,
    title: "Chưa có tin mới trong ngành của bạn",
    description: "Mỗi đêm hệ thống quét tin mới đúng ngành và kinh nghiệm của bạn. Thêm nghề hoặc tỉnh làm việc trong hồ sơ để thấy nhiều tin hơn.",
    action: "Cập nhật hồ sơ",
    href: "/dashboard/profile",
  },
  saved: {
    icon: BookmarkSimple,
    title: "Bạn chưa lưu tin nào",
    description: "Bấm biểu tượng lưu ở một tin để giữ lại và xem nhanh ở đây.",
    action: "Tìm việc làm",
    href: "/dashboard/jobs",
  },
};

const SCORE_CLASS: Record<ScoreTone, string> = {
  good: "text-emerald-600",
  mid: "text-amber-600",
  low: "text-slate-500",
};

/** Nút lưu tin, tự gọi API lưu hoặc bỏ lưu. */
function SaveButton({ jobId, initial }: { jobId: string; initial: boolean }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(initial);

  const toggle = async () => {
    const next = !saved;
    setSaved(next);
    try {
      await (next ? jobsService.save(jobId) : jobsService.unsave(jobId));
      afterSaveJob(queryClient, jobId, next);
    } catch {
      setSaved(!next);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
      aria-pressed={saved}
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-primary-200 hover:text-primary-600"
    >
      <Bookmark weight={saved ? "fill" : "regular"} className={cn("size-4", saved && "text-primary-600")} />
    </button>
  );
}

/** Một dòng tin: logo, tên tin, dòng phụ, % phù hợp tô theo mức (khi có điểm), nút lưu và nút hành động viền nhẹ. */
export function TopMatchRow({
  job,
  score,
  meta,
  note,
  actionLabel,
}: {
  job: Job;
  score: number | null;
  meta: string;
  note: string | null;
  actionLabel: string;
}) {
  const href = `/dashboard/jobs/${job.id}`;

  return (
    <li className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-slate-100 py-3.5 first:border-t-0 first:pt-0 md:grid-cols-[2.75rem_minmax(0,1fr)_3.5rem_auto]">
      <CompanyLogo src={job.companyLogo} size="sm" className="rounded-xl text-xs" />

      <div className="min-w-0">
        <Link href={href} className="block truncate text-sm font-semibold text-slate-900 hover:text-primary-600">
          {job.title}
        </Link>
        <p className="truncate text-xs text-slate-500">{meta}</p>
        {note && <p className="truncate text-xs text-slate-500">{note}</p>}
      </div>

      <b
        title={score === null ? undefined : "Điểm phù hợp do AI chấm"}
        className={cn(
          "text-right text-base font-semibold tabular-nums",
          score === null ? "text-slate-300" : SCORE_CLASS[matchTone(score)],
        )}
      >
        {score === null ? "—" : `${score}%`}
      </b>

      <div className="col-span-3 flex items-center justify-end gap-2 md:col-span-1">
        <SaveButton jobId={job.id} initial={job.saved} />
        <Link
          href={href}
          className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold whitespace-nowrap text-slate-700 hover:border-primary-300 hover:text-primary-700"
        >
          {actionLabel}
        </Link>
      </div>
    </li>
  );
}

/** "Việc đang chờ bạn": tab tin chấm điểm cao nhất chưa nộp, tin mới nhất trong ngành và tin đã lưu. */
export function TopMatches() {
  const { data } = useDashboard();
  const [tab, setTab] = useState<Tab>("best");
  const shortlistView: ShortlistView = tab === "saved" ? "saved" : "newest";
  const shortlist = useJobShortlist(shortlistView, tab !== "best");
  if (!data) return null;

  const current = TABS.find((item) => item.value === tab)!;
  let rows: { job: Job; score: number | null }[] | null = null;
  if (tab === "best") {
    rows = data.pendingMatches.map((match) => ({ job: toJobCard(match), score: match.overallScore }));
  } else if (shortlist.data) {
    rows = shortlist.data.items.map((item) => ({ job: toJobCardFromRecord(item), score: item.match?.overallScore ?? null }));
  }


  return (
    <DashSection
      title="Việc đang chờ bạn"
      action={<UnderlineTabs tabs={TABS} value={tab} onChange={setTab} label="Lọc tin đang chờ" />}
      className="flex h-full flex-col"
    >
      {rows === null && <p className="py-6 text-sm text-slate-500">Đang tải…</p>}
      {rows?.length === 0 && (
        <EmptyState
          icon={EMPTY[tab].icon}
          title={EMPTY[tab].title}
          description={EMPTY[tab].description}
          className="flex-1 justify-center"
          action={
            <Link href={EMPTY[tab].href}>
              <Button variant="outline">{EMPTY[tab].action}</Button>
            </Link>
          }
        />
      )}
      {rows && rows.length > 0 && (
        <ul className="flex flex-1 flex-col [&>li]:max-h-24 [&>li]:flex-1">
          {rows.map(({ job, score }) => (
            <TopMatchRow
              key={job.id}
              job={job}
              score={score}
              meta={[job.company, displayLocation(job.location).text].filter(Boolean).join(" · ")}
              note={null}
              actionLabel="Ứng tuyển"
            />
          ))}
        </ul>
      )}
      {rows && rows.length > 0 && (
        <Link
          href={current.href}
          className="flex items-center justify-center gap-1.5 pt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          Xem tất cả <ArrowRight className="size-4" />
        </Link>
      )}
    </DashSection>
  );
}
