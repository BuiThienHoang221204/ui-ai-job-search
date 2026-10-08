"use client";

import Link from "next/link";
import { ChartBar } from "@phosphor-icons/react/ssr";
import type { DashboardOverview } from "@/types";
import { cn } from "@/utils";
import { DashSection } from "@/components/dashboard/dash-section";
import { useDashboard } from "./use-dashboard";

const GOOD_SCORE = 70;

const SCORE_ROWS = [
  { key: "skills", label: "Kỹ năng chuyên môn", weight: "30%" },
  { key: "career", label: "Định hướng nghề", weight: "30%" },
  { key: "experience", label: "Kinh nghiệm", weight: "25%" },
  { key: "behavioral", label: "Hành vi & văn hoá", weight: "15%" },
] as const;

type TodayScore = DashboardOverview["todayScore"];

/** Khóa của chiều có điểm thấp nhất, `null` khi chưa chiều nào có điểm. */
function weakestKey(score: TodayScore) {
  let weakest: (typeof SCORE_ROWS)[number]["key"] | null = null;
  for (const row of SCORE_ROWS) {
    const value = score[row.key];
    if (value === null) continue;
    if (weakest === null || value < (score[weakest] ?? Infinity)) weakest = row.key;
  }
  return weakest;
}

/** Điểm phù hợp gần đây: một con số lớn và bốn chiều điểm dạng thanh mảnh, có vạch mốc 70. */
export function ScoreBreakdown() {
  const { data } = useDashboard();
  if (!data) return null;
  const todayScore = data.todayScore;
  const overall = todayScore.overall;
  const weakest = weakestKey(todayScore);

  const action = (
    <Link href="/dashboard/cv-optimizer" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
      Mở CV Optimizer →
    </Link>
  );

  return (
    <DashSection title="Điểm phù hợp gần đây" icon={ChartBar} action={action}>
      {overall === null ? (
        <p className="text-sm text-slate-500">Chưa có lần chấm nào. Mở một tin và bấm chấm điểm để thấy phân tích ở đây.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
          <div>
            <p className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight text-slate-900 tabular-nums">{overall}</span>
              <span className="text-lg text-slate-400">/100</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Trung bình {todayScore.sampleSize} lần chấm gần nhất.
              {overall < GOOD_SCORE && ` Cần thêm khoảng ${GOOD_SCORE - overall} điểm để đạt mốc ${GOOD_SCORE}.`}
            </p>
          </div>

          <div className="grid gap-3.5 pt-1">
            {SCORE_ROWS.map((row) => {
              const value = todayScore[row.key];
              const isWeakest = row.key === weakest;
              return (
                <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_1.75rem] items-center gap-x-3 gap-y-1.5">
                  <span className="col-span-2 flex justify-between gap-2 text-sm text-slate-700">
                    {row.label}
                    <span className={cn("text-xs text-slate-400", isWeakest && "text-amber-600")}>
                      {row.weight}
                      {isWeakest && " · thấp nhất"}
                    </span>
                  </span>
                  <span className="relative h-1.5 rounded-full bg-slate-100">
                    <span
                      className={cn("absolute inset-y-0 left-0 rounded-full", isWeakest ? "bg-amber-500" : "bg-primary-200")}
                      style={{ width: `${value ?? 0}%` }}
                    />
                    <span className="absolute -inset-y-1 w-px bg-slate-400" style={{ left: `${GOOD_SCORE}%` }} />
                  </span>
                  <span className={cn("text-right text-sm font-semibold tabular-nums", isWeakest ? "text-amber-600" : "text-slate-800")}>
                    {value ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashSection>
  );
}
