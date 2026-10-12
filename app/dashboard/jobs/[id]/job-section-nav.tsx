"use client";

import { useEffect, useRef, useState } from "react";
import { companiesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { cn, matchTone } from "@/utils";
import { useJobDetail } from "@/hooks/use-job-detail";

const BADGE_TONES = {
  good: "bg-emerald-50 text-emerald-700",
  mid: "bg-amber-50 text-amber-700",
  low: "bg-rose-50 text-rose-600",
} as const;

interface Section {
  id: string;
  label: string;
  badge?: string;
  badgeClassName?: string;
}

/** Thanh mục lục dính trên trang chi tiết tin: bấm để cuộn tới phần đó, mục đang xem tự sáng. */
export function JobSectionNav({ jobId }: { jobId: string }) {
  const { data } = useJobDetail(jobId);
  const match = data?.match ?? null;
  const system = data?.job.systemMatch ?? null;
  const { data: company } = useApiQuery(
    keys.companyBrief(jobId),
    () => companiesService.briefForJob(jobId),
    { errorMessage: "Không tải được thông tin công ty" },
  );
  const [active, setActive] = useState("tong-quan");
  const lockedUntil = useRef(0);

  const score = match?.overallScore ?? null;
  const must = system?.checks.filter((check) => check.kind === "SKILL") ?? [];
  const mustMet = must.filter((check) => check.met === true).length;
  const rating = company?.brief?.rating;

  const sections: Section[] = [
    {
      id: "tong-quan",
      label: "Tổng quan",
      badge: score === null ? undefined : `${score}%`,
      badgeClassName:
        score === null ? undefined : BADGE_TONES[matchTone(score)],
    },
    ...(system && system.total > 0
      ? [
          {
            id: "doi-chieu",
            label: "Đối chiếu yêu cầu",
            badge: must.length ? `${mustMet}/${must.length}` : undefined,
            badgeClassName: must.length
              ? BADGE_TONES[matchTone((mustMet / must.length) * 100)]
              : undefined,
          },
        ]
      : []),
    { id: "chuan-bi", label: "Chuẩn bị ứng tuyển" },
    { id: "mo-ta", label: "Mô tả công việc" },
    ...(company?.researchable
      ? [
          {
            id: "cong-ty",
            label: "Review công ty",
            badge: rating ? `★ ${rating}` : undefined,
          },
        ]
      : []),
  ];
  const ids = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible && Date.now() > lockedUntil.current)
          setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const id of ids.split(",")) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav className="sticky top-0 z-10 -mt-2 flex gap-7 overflow-x-auto overflow-y-hidden bg-paper/95 shadow-[inset_0_-1px_0_var(--color-slate-200)] backdrop-blur [scrollbar-width:none]">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => {
            lockedUntil.current = Date.now() + 1000;
            setActive(section.id);
            document
              .getElementById(section.id)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-2 border-b-2 py-3 text-sm transition-colors",
            active === section.id
              ? "border-primary-600 font-semibold text-slate-900"
              : "border-transparent font-medium text-slate-500 hover:text-slate-800",
          )}
        >
          {section.label}
          {section.badge && (
            <span
              className={cn(
                "rounded-full px-2 py-px text-xs font-semibold tabular-nums",
                section.badgeClassName ?? "bg-slate-100 text-slate-500",
              )}
            >
              {section.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
