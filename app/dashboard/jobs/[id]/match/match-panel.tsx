"use client";

import type { ReactNode } from "react";
import { useJobDetail } from "@/hooks/use-job-detail";
import { useJobScoring } from "@/hooks/use-job-scoring";
import { LiveScoringCard } from "./live-scoring-card";
import { ScoreCard } from "./score-card";
import { NotScoredCard, UnscoredCard } from "./unscored-card";
import { useSession } from "@/hooks/use-session";
import { useLoginModal } from "@/hooks/use-login-modal";

/** Phần "Tổng quan" của tin: thẻ điểm AI, hoặc thẻ mời chấm khi chưa có điểm. Giữ riêng state chấm để stream không làm cả trang render lại. */
export function MatchPanel({ jobId }: { jobId: string }) {
  const match = useJobDetail(jobId).data?.match ?? null;
  const { scoring, partial, score } = useJobScoring(jobId);
  const { user } = useSession();
  const openLogin = useLoginModal((s) => s.open);
  const overallScore = match?.overallScore ?? null;
  const onScore = user
    ? score
    : () =>
        openLogin({
          reason: "Đăng nhập để AI chấm mức độ phù hợp của tin này với hồ sơ của bạn.",
        });

  let card: ReactNode;
  if (match && overallScore !== null) {
    card = (
      <ScoreCard
        match={match}
        overallScore={overallScore}
        onScore={onScore}
        scoring={scoring}
      />
    );
  } else if (match) {
    card = <UnscoredCard match={match} onScore={onScore} scoring={scoring} />;
  } else {
    card = <NotScoredCard onScore={onScore} scoring={scoring} />;
  }

  return (
    <div id="tong-quan" className="scroll-mt-20 space-y-6">
      {scoring && <LiveScoringCard partial={partial} />}
      {card}
    </div>
  );
}
