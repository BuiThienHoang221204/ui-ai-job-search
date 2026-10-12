"use client";

import { useJobDetail } from "@/hooks/use-job-detail";
import { useJobScoring } from "@/hooks/use-job-scoring";
import { LiveScoringCard } from "./live-scoring-card";
import { ScoreCard } from "./score-card";
import { NotScoredCard, UnscoredCard } from "./unscored-card";

/** Phần "Tổng quan" của tin: thẻ điểm AI, hoặc thẻ mời chấm khi chưa có điểm. Giữ riêng state chấm để stream không làm cả trang render lại. */
export function MatchPanel({ jobId }: { jobId: string }) {
  const match = useJobDetail(jobId).data?.match ?? null;
  const { scoring, partial, score } = useJobScoring(jobId);
  const overallScore = match?.overallScore ?? null;

  return (
    <div id="tong-quan" className="scroll-mt-20 space-y-6">
      {scoring && <LiveScoringCard partial={partial} />}
      {match && overallScore !== null ? (
        <ScoreCard
          match={match}
          overallScore={overallScore}
          onScore={score}
          scoring={scoring}
        />
      ) : match ? (
        <UnscoredCard match={match} onScore={score} scoring={scoring} />
      ) : (
        <NotScoredCard onScore={score} scoring={scoring} />
      )}
    </div>
  );
}
