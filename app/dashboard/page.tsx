"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { dashboardService } from "@/services";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { ResponsiveBannerAd } from "@/components/ads/ad-slot";
import { SkillResources } from "@/components/ads/affiliate-inline";
import { suggestionSkill } from "@/lib/affiliate";
import { useSession } from "@/components/dashboard/session";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { onboardingLevel } from "./onboarding-state";
import { FirstRun } from "./first-run";
import { QuickStartOnboarding } from "./quick-start-onboarding";
import { QuickStrip } from "./quick-strip";
import { ScoreBreakdown } from "./score-breakdown";
import { TopMatches } from "./top-matches";

/** Trang tổng quan của dashboard. */
export default function DashboardPage() {
  const { user, loading: loadingUser } = useSession();
  const { data, error, reload } = useApiQuery(
    ["dashboard", "overview"],
    () => dashboardService.overview(),
    { errorMessage: "Không tải được dữ liệu tổng quan" },
  );
  const [skippedQuickStart, setSkippedQuickStart] = useState(false);

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;
  if (!data || loadingUser) return <DashboardSkeleton />;
  const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";

  if (!data.occupationCode && !skippedQuickStart) {
    return (
      <QuickStartOnboarding
        firstName={firstName}
        onDone={reload}
        onSkip={() => setSkippedQuickStart(true)}
      />
    );
  }

  if (onboardingLevel(data) === "takeover") {
    return <FirstRun firstName={firstName} data={data} />;
  }

  return (
    <div className="space-y-5">
      <QuickStrip data={data} />
      <TopMatches matches={data.topMatches} />
      <ResponsiveBannerAd align="start" />

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <AISuggestionCard suggestions={data.suggestions} />
        <SkillResources
          placement="dashboard"
          occupation={data.occupationCode}
          skills={data.suggestions.flatMap((suggestion) => suggestionSkill(suggestion) ?? [])}
        />
      </div>
      <ScoreBreakdown todayScore={data.todayScore} />
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
