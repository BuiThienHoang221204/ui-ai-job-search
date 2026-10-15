"use client";

import { useRouter } from "next/navigation";
import { loginPathForJob } from "@/lib/public-job";
import { useJobDetail } from "@/hooks/use-job-detail";
import { useJobScoring } from "@/hooks/use-job-scoring";
import { LiveScoringCard } from "./live-scoring-card";
import { ScoreCard } from "./score-card";
import { NotScoredCard, UnscoredCard } from "./unscored-card";
import { useSession } from "@/hooks/use-session";

/** Phần "Tổng quan" của tin: thẻ điểm AI, hoặc thẻ mời chấm khi chưa có điểm. Giữ riêng state chấm để stream không làm cả trang render lại. */
export function MatchPanel({ jobId }: { jobId: string }) {
  const match = useJobDetail(jobId).data?.match ?? null;
  const { scoring, partial, score } = useJobScoring(jobId);
  const { user } = useSession();
  const router = useRouter();
  const overallScore = match?.overallScore ?? null;
  const onScore = user ? score : () => router.push(loginPathForJob(jobId));

  return (
    <div id="tong-quan" className="scroll-mt-20 space-y-6">
      {scoring && <LiveScoringCard partial={partial} />}
      {match && overallScore !== null ? (
        <ScoreCard
          match={match}
          overallScore={overallScore}
          onScore={onScore}
          scoring={scoring}
        />
      ) : match ? (
        <UnscoredCard match={match} onScore={onScore} scoring={scoring} />
      ) : (
        <NotScoredCard onScore={onScore} scoring={scoring} />
      )}
    </div>
  );
}
