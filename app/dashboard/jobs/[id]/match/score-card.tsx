import Link from "next/link";
import { ArrowClockwise } from "@phosphor-icons/react/ssr";
import type { JobMatchDetail, ProfileRecord } from "@/services";
import { AIMatchProgress } from "@/components/dashboard/ai-match-progress";
import { ScoreBar } from "@/components/dashboard/score-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { SCORE_ROWS } from "../job-detail-constants";

/** Dòng cho biết điểm được chấm dựa trên hồ sơ nào (headline và kỹ năng chính). */
function ScoringBasis({ profile }: { profile: ProfileRecord | null }) {
  if (!profile) return null;

  const skills = profile.primarySkills.slice(0, 4).join(", ");
  const parts = [profile.headline, skills].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
      Chấm theo hồ sơ của bạn: <span className="text-slate-700">{parts.join(" · ")}</span>{" "}
      <Link
        href="/dashboard/profile"
        className="font-medium whitespace-nowrap underline"
      >
        Sửa hồ sơ
      </Link>
    </p>
  );
}

/** Thẻ điểm tổng; chỉ gọi khi `overallScore` đã có. */
export function ScoreCard({
  match,
  overallScore,
  profile,
  onScore,
  scoring,
}: {
  match: JobMatchDetail;
  overallScore: number;
  profile: ProfileRecord | null;
  onScore: (force: boolean) => void;
  scoring: boolean;
}) {
  return (
    <Card className="p-6">
      <AIMatchProgress value={overallScore} />
      {match.stale && (
        <div className="mt-4 rounded-md bg-amber-50 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-amber-900">
            Điểm này chấm <strong>trước khi bạn sửa hồ sơ</strong> nên có thể
            không còn đúng.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            loading={scoring}
            onClick={() => onScore(true)}
          >
            {!scoring && <ArrowClockwise className="size-4" />}
            Chấm lại theo hồ sơ hiện tại
          </Button>
        </div>
      )}
      <ScoringBasis profile={profile} />
    </Card>
  );
}

/** Từng chiều đánh giá kèm trọng số trong điểm tổng. */
export function ScoreDetailCard({ match }: { match: JobMatchDetail }) {
  return (
    <SectionCard
      compact
      title="Chi tiết đánh giá AI"
      description="Mức độ khớp từng chiều, kèm trọng số trong điểm tổng"
    >
      {SCORE_ROWS.map(({ key, label, weight }) => (
        <ScoreBar key={key} label={label} weight={weight} value={match[key]} />
      ))}
    </SectionCard>
  );
}
