"use client";

// import { ResponsiveBannerAd } from "@/components/ads/ad-slot";
// import { SkillResources } from "@/components/ads/affiliate-inline";
import { PageError } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
// import { suggestionSkill } from "@/lib/affiliate";
import { FirstRun } from "./first-run";
import { MarketCard } from "./market-card";
import { onboardingLevel } from "@/lib/onboarding";
import { WeeklyGoals } from "./weekly-goals";
import { QuickStartOnboarding } from "./quick-start-onboarding";
import { DashboardHero } from "./dashboard-hero";
import { JourneyCard } from "./journey-card";
import { ApplicationsCard } from "./applications-card";
import { ScoreBreakdown } from "./score-breakdown";
import { TopMatches } from "./top-matches";
import { useDashboard } from "@/hooks/use-dashboard";
import { useSession } from "@/hooks/use-session";

/** Trang tổng quan của dashboard. */
export function DashboardView() {
  const { user, loading: loadingUser } = useSession();
  const { data, error } = useDashboard();

  if (error) return <PageError title="Không tải được dữ liệu" message={error} />;
  if (!data || loadingUser) return <DashboardSkeleton />;

  if (!data.occupationCode || data.occupationCode === "OTHER") {
    const firstName = user?.name.split(" ").slice(-2).join(" ") ?? "bạn";
    return <QuickStartOnboarding firstName={firstName} />;
  }

  // const adSkills = data.suggestions.flatMap((suggestion) => suggestionSkill(suggestion) ?? []);

  return (
    <div className="space-y-4 pb-6">
      {onboardingLevel(data) === "takeover" ? (
        <FirstRun />
      ) : (
        <>
          <DashboardHero />
          {/* <ResponsiveBannerAd align="start" /> */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="min-w-0 lg:col-span-2 lg:row-span-2">
              {/* <SkillResources placement="dashboard" occupation={data.occupationCode} skills={adSkills} /> */}
              <TopMatches />
            </Card>
            <Card className="border-primary-100 bg-[linear-gradient(160deg,var(--color-primary-50),var(--color-surface-card)_70%)]">
              <ScoreBreakdown />
            </Card>
            <Card className="border-amber-200/70 bg-[linear-gradient(160deg,var(--color-amber-50),var(--color-surface-card)_70%)]">
              <WeeklyGoals />
            </Card>
          </div>
          <Card className="grid divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <JourneyCard />
            <MarketCard />
            <ApplicationsCard />
          </Card>
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
