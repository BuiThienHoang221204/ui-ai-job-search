import type { JobMatchDetail, ProfileRecord, SystemMatch } from "@/services";
import type { PartialEvaluation } from "@/lib/match-stream";
import { LiveScoringCard } from "./live-scoring-card";
import { MatchActions } from "./match-actions";
import { ScoreCard, ScoreDetailCard } from "./score-card";
import { SystemMatchCard } from "./system-match-card";
import { NotScoredCard, UnscoredCard } from "./unscored-card";

/** Khung chấm điểm của tin: chọn thẻ phù hợp theo trạng thái chấm hiện tại. */
export function MatchPanel({
  jobId,
  match,
  partial,
  profile,
  system,
  onScore,
  scoring,
}: {
  jobId: string;
  match: JobMatchDetail | null;
  partial: PartialEvaluation | null;
  profile: ProfileRecord | null;
  system: SystemMatch | null;
  onScore: (force: boolean) => void;
  scoring: boolean;
}) {
  const overallScore = match?.overallScore ?? null;

  const scoreCard =
    match && overallScore !== null ? (
      <ScoreCard
        match={match}
        overallScore={overallScore}
        profile={profile}
        onScore={onScore}
        scoring={scoring}
      />
    ) : null;

  const detailCard = !match ? (
    <NotScoredCard onScore={onScore} scoring={scoring} />
  ) : overallScore === null ? (
    <UnscoredCard match={match} onScore={onScore} scoring={scoring} />
  ) : (
    <ScoreDetailCard match={match} />
  );

  const paired = Boolean(system && system.total > 0) && scoreCard !== null;
  const actions = <MatchActions jobId={jobId} />;

  return (
    <div className="@container space-y-6">
      {paired ? (
        <>
          <div className="grid items-start gap-6 @3xl:grid-cols-2">
            <SystemMatchCard system={system} profile={profile} />
            <div className="space-y-6">
              {scoring && <LiveScoringCard partial={partial} />}
              {scoreCard}
            </div>
          </div>
          {actions}
          {detailCard}
        </>
      ) : (
        <>
          {scoring && <LiveScoringCard partial={partial} />}
          {scoreCard}
          {scoreCard && actions}
          {detailCard}
          {!scoreCard && actions}
          <SystemMatchCard system={system} profile={profile} />
        </>
      )}
    </div>
  );
}
