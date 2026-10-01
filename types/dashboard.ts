import type { JobMatchWithJob } from "./job";

export type AiSuggestionType = "cv" | "apply" | "network" | "skill";

export interface AiSuggestion {
  id: string;
  type: AiSuggestionType;
  title: string;
  description: string;
  href?: string;
}

export interface TodayScore {
  overall: number | null;
  skills: number | null;
  experience: number | null;
  behavioral: number | null;
  career: number | null;
  sampleSize: number;
}

export interface DashboardOverview {
  profileCompletion: number;
  /** `null` khi chưa qua "Chọn nhanh" lẫn CV. */
  occupationCode: string | null;
  matchingJobs: { total: number; newThisWeek: number };
  averageMatchScore: number | null;
  topMatches: JobMatchWithJob[];
  suggestions: AiSuggestion[];
  applications: { total: number; active: number };
  todayScore: TodayScore;
}
