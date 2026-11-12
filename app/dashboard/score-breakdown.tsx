"use client";

import Link from "next/link";
import type { DashboardOverview } from "@/types";
import { DashSection } from "@/components/ui/dash-section";
import { useDashboard } from "@/hooks/use-dashboard";
import { MeterRow } from "@/components/ui/meter-row";

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

/** Điểm phù hợp gần đây: một con số lớn và bốn chiều điểm, chiều thấp nhất tô cam, vạch mốc 70. */
export function ScoreBreakdown() {
  const { data } = useDashboard();
  if (!data) return null;
  const todayScore = data.todayScore;
  const overall = todayScore.overall;
  const weakest = weakestKey(todayScore);

  const action = (
    <Link href="/dashboard/cv-optimizer" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
      Mở Tối ưu CV
    </Link>
  );

  return (
    <DashSection title="Điểm phù hợp gần đây" action={action}>
      {overall === null ? (
        <p className="text-sm text-slate-500">Chưa có lần chấm nào. Mở một tin và bấm chấm điểm để thấy phân tích ở đây.</p>
      ) : (
        <>
          <p className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight text-slate-900 tabular-nums">{overall}</span>
            <span className="text-lg text-slate-500">/100</span>
          </p>
          <p className="mt-1.5 text-xs text-slate-600">
            Trung bình {todayScore.sampleSize} lần chấm gần nhất.
            {overall < GOOD_SCORE && ` Cần thêm khoảng ${GOOD_SCORE - overall} điểm để đạt mốc ${GOOD_SCORE}.`}
          </p>
          <div className="mt-4 grid gap-3">
            {SCORE_ROWS.map((row) => {
              const value = todayScore[row.key];
              const isWeakest = row.key === weakest;
              return (
                <MeterRow
                  key={row.key}
                  label={row.label}
                  hint={isWeakest ? `${row.weight} · thấp nhất` : row.weight}
                  value={value ?? "—"}
                  percent={value ?? 0}
                  warn={isWeakest}
                  mark={GOOD_SCORE}
                />
              );
            })}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-3 w-0.5 rounded-full bg-slate-700" />
            Vạch dọc là mốc {GOOD_SCORE}
          </p>
        </>
      )}
    </DashSection>
  );
}
