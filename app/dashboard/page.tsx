"use client";

import { ResponsiveBannerAd } from "@/components/ads/ad-slot";
import { SkillResources } from "@/components/ads/affiliate-inline";
import { useSession } from "@/components/dashboard/session";
import { PageError } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { suggestionSkill } from "@/lib/affiliate";
import { FirstRun } from "./first-run";
import { MarketCard } from "./market-card";
import { onboardingLevel } from "./onboarding-state";
import { ProgressPanel } from "./progress-panel";
import { QuickStartOnboarding } from "./quick-start-onboarding";
import { QuickStrip } from "./quick-strip";
import { ScoreBreakdown } from "./score-breakdown";
import { TopMatches } from "./top-matches";
import { useDashboard } from "./use-dashboard";

/** Trang tổng quan của dashboard. */
export default function DashboardPage() {
  const { user, loading: loadingUser } = useSession();
  const { data, error, reload } = useDashboard();

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;
  if (!data || loadingUser) return <DashboardSkeleton />;

  if (!data.occupationCode || data.occupationCode === "OTHER") {
    const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";
    return <QuickStartOnboarding firstName={firstName} onDone={reload} />;
  }

  const adSkills = data.suggestions.flatMap((suggestion) => suggestionSkill(suggestion) ?? []);

  return (
    <div className="mx-auto w-full max-w-340 space-y-5 pb-6">
      {onboardingLevel(data) === "takeover" ? (
        <FirstRun />
      ) : (
        <>
          <QuickStrip />
          <Card className="grid divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <MarketCard />
            <ScoreBreakdown />
          </Card>
          <ResponsiveBannerAd align="start" />
          <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18.75rem,1fr)]">
            <div className="grid min-w-0 content-start gap-5">
              <SkillResources placement="dashboard" occupation={data.occupationCode} skills={adSkills} />
              <TopMatches />
            </div>
            <ProgressPanel />
          </div>
        </>
      )}
    </div>
  );
}

/** Khung xám giữ bố cục trang tổng quan trong lúc tải. */
function DashboardSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-8" />
      <SkeletonGrid
        count={3}
        className="grid gap-4 xl:grid-cols-3"
        itemClassName="h-52"
      />
    </SkeletonPage>
  );
}
