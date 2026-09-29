import type { DashboardOverview } from "@/types";

export const PROFILE_READY = 80;

export const ENOUGH_MATCHES = 3;

export type OnboardingLevel = "takeover" | "nudge" | "done";

/** Xác định mức hướng dẫn người mới dựa trên hồ sơ và số việc đã chấm. */
export function onboardingLevel(data: DashboardOverview): OnboardingLevel {
  if (data.matchingJobs.total === 0) return "takeover";
  if (
    data.profileCompletion < PROFILE_READY ||
    data.matchingJobs.total < ENOUGH_MATCHES
  ) {
    return "nudge";
  }
  return "done";
}
