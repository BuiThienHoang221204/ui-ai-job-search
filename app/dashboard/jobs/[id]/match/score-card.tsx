import { ArrowClockwise, Info } from "@phosphor-icons/react/ssr";
import type { JobMatchDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { SCORE_ROWS } from "@/lib/match-labels";
import { cn } from "@/lib/cn";
import { matchTone, matchToneClasses, scoreBarClass } from "@/lib/score";
import { relativeTime } from "@/lib/date";

const VERDICTS = {
  good: "Rất phù hợp",
  mid: "Khá phù hợp",
  low: "Ít phù hợp",
} as const;

/** Khối tổng quan điểm AI: điểm tổng, kết luận, nhận xét và bốn chiều đánh giá. */
export function ScoreCard({
  match,
  overallScore,
  onScore,
  scoring,
}: {
  match: JobMatchDetail;
  overallScore: number;
  onScore: (force: boolean) => void;
  scoring: boolean;
}) {
  const tone = matchToneClasses(overallScore);

  return (
    <Card className="overflow-visible">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <ProgressCircle
          value={overallScore}
          size={128}
          strokeWidth={10}
          strokeClassName={tone.stroke}
        >
          <span className="text-center">
            <span className="block text-4xl leading-none font-bold tracking-tight text-slate-900">
              {overallScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </span>
        </ProgressCircle>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className={cn("text-2xl font-bold tracking-tight", tone.text)}>
              {VERDICTS[matchTone(overallScore)]}
            </h2>
            {match.evaluatedAt && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                AI chấm {relativeTime(match.evaluatedAt)}
              </span>
            )}
          </div>
          {match.recommendation && (
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">
                AI nhận xét:{" "}
              </span>
              {match.recommendation}
            </p>
          )}
          {match.stale && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 py-2 pr-2 pl-3">
              <p className="text-xs leading-relaxed text-amber-900">
                Điểm này chấm <strong>trước khi bạn sửa hồ sơ</strong> nên có
                thể không còn đúng.
              </p>
              <Button
                size="sm"
                variant="outline"
                loading={scoring}
                onClick={() => onScore(true)}
              >
                {!scoring && <ArrowClockwise className="size-4" />}
                Chấm lại
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-slate-100 lg:grid-cols-4">
        {SCORE_ROWS.map(({ key, note, label, weight }) => {
          const value = match[key] ?? null;
          const detail = match[note];
          return (
            <div
              key={key}
              tabIndex={detail ? 0 : undefined}
              className="group relative border-slate-100 px-5 py-4 not-first:border-l max-lg:nth-3:border-l-0 max-lg:nth-[n+3]:border-t"
            >
              <p className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                {label}
                {detail && <Info className="size-4 text-slate-400" />}
              </p>
              <p className="mt-1 mb-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {value ?? "—"}
                </span>
                <span className="text-xs text-slate-400">chiếm {weight}</span>
              </p>
              <Progress
                value={value ?? 0}
                barClassName={scoreBarClass(value)}
                className="h-1.5"
              />
              {detail && (
                <p className="invisible absolute inset-x-3 top-full z-10 -mt-1 rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-100 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100">
                  {detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
