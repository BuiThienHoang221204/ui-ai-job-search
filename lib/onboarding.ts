import type { DashboardOverview, JourneyStep } from "@/types";

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

/** Năm chặng của hành trình tìm việc kèm việc nên làm ở mỗi chặng; chặng đang làm là chặng đầu tiên chưa xong. */
export function journeySteps(data: DashboardOverview): { steps: JourneyStep[]; current: number } {
  const avg = data.averageMatchScore === null ? "" : ` · TB ${data.averageMatchScore} điểm`;
  const steps: JourneyStep[] = [
    {
      label: "Hoàn thiện hồ sơ",
      description: `Hồ sơ ${data.profileCompletion}%`,
      done: data.profileCompletion >= PROFILE_READY,
      action: "Hoàn thiện hồ sơ",
      href: "/dashboard/profile",
    },
    {
      label: "Chấm điểm việc",
      description: `${data.totalScored} tin đã chấm${avg}`,
      done: data.totalScored >= ENOUGH_MATCHES,
      action: "Chấm điểm tin phù hợp",
      href: "/dashboard/jobs?scored=1",
    },
    {
      label: "Tối ưu CV",
      description: `${data.journey.cvs} CV đã tạo`,
      done: data.journey.cvs > 0,
      action: "Tối ưu CV cho một tin",
      href: "/dashboard/cv-optimizer",
    },
    {
      label: "Ứng tuyển",
      description: `${data.journey.applied} đơn đã nộp`,
      done: data.journey.applied > 0,
      action: "Ứng tuyển tin hợp nhất",
      href: "/dashboard/matches",
    },
    {
      label: "Luyện phỏng vấn",
      description: `${data.journey.interviews} buổi đã luyện`,
      done: data.journey.interviews > 0,
      action: "Luyện phỏng vấn thử",
      href: "/dashboard/interview",
    },
  ];
  const firstTodo = steps.findIndex((step) => !step.done);
  return { steps, current: firstTodo === -1 ? steps.length : firstTodo };
}
