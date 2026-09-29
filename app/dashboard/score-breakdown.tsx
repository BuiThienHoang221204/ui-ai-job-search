import Link from "next/link";
import { FileText, Percent } from "@phosphor-icons/react/ssr";
import type { DashboardOverview } from "@/types";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SCORE_ROWS = [
  { key: "skills", label: "Kỹ năng chuyên môn", weight: "30%" },
  { key: "experience", label: "Kinh nghiệm làm việc", weight: "25%" },
  { key: "behavioral", label: "Hành vi & văn hoá", weight: "15%" },
  { key: "career", label: "Định hướng nghề nghiệp", weight: "30%" },
] as const;

/** Bốn hàng điểm theo các chiều có trọng số dưới vòng tròn điểm phù hợp. */
export function ScoreBreakdown({
  todayScore,
}: {
  todayScore: DashboardOverview["todayScore"];
}) {
  const overall = todayScore.overall;

  const weakest = SCORE_ROWS.filter(
    (row) => todayScore[row.key] !== null,
  ).sort((a, b) => todayScore[a.key]! - todayScore[b.key]!)[0];

  return (
    <Card className="border-slate-200/90 bg-white">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="bg-primary-50 text-primary-700 flex size-6 items-center justify-center rounded-md">
            <Percent className="size-4" />
          </span>
          Điểm phù hợp gần đây
        </CardTitle>
        <CardDescription className="text-xs">
          {overall === null
            ? "Chưa có lần chấm nào"
            : `Trung bình ${todayScore.sampleSize} lần chấm gần nhất`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {overall === null ? (
          <div className="w-full py-6 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Chưa đủ dữ liệu để chấm
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hoàn thiện hồ sơ và quét tin tuyển dụng, hệ thống sẽ chấm độ phù hợp
              rồi hiện phân tích tại đây.
            </p>
          </div>
        ) : (
          <div className="grid items-center gap-6 lg:grid-cols-[190px_1fr_210px]">
            <AIMatchProgress value={overall} size={130} strokeWidth={9} />

            <div className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {SCORE_ROWS.map((row) => (
                <ScoreBar
                  key={row.key}
                  label={row.label}
                  weight={row.weight}
                  value={todayScore[row.key]}
                />
              ))}
            </div>

            <div>
              <Link href="/dashboard/cv-optimizer" className="w-full">
                <Button variant="secondary" className="w-full">
                  <FileText className="size-4.5" />
                  Mở CV Optimizer
                </Button>
              </Link>
              {weakest && (
                <p className="mt-2 text-center text-2xs leading-relaxed text-slate-500">
                  Thấp nhất là{" "}
                  <span className="font-semibold text-slate-700">
                    {weakest.label}
                  </span>{" "}
                  — bắt đầu từ đó
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
