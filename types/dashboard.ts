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

export interface MarketCount {
  code: string;
  name: string;
  count: number;
}

export interface OccupationMarket {
  occupationName: string;
  total: number;
  days: number;
  provinces: MarketCount[];
  subs: MarketCount[];
}

export interface DashboardOverview {
  profileCompletion: number;
  /** `null` khi chưa qua "Chọn nhanh" lẫn CV. */
  occupationCode: string | null;
  /** Tin mới trong ngành của hồ sơ; `null` khi chưa biết ngành. */
  market: OccupationMarket | null;
  matchingJobs: { total: number; newThisWeek: number };
  averageMatchScore: number | null;
  /** Tin chấm điểm cao nhất mà người dùng chưa nộp đơn. */
  pendingMatches: JobMatchWithJob[];
  skillGaps: { skill: string; jobCount: number }[];
  totalScored: number;
  journey: { cvs: number; applied: number; interviews: number };
  weekly: Record<"documents" | "applied" | "interviews", { done: number; goal: number }>;
  streak: { days: number; week: boolean[] };
  /** Tin đã chấm gần nhất chưa có CV và chưa nộp đơn. */
  resume: { jobId: string; title: string; company: string; score: number | null } | null;
  suggestions: AiSuggestion[];
  applications: { total: number; active: number };
  todayScore: TodayScore;
}
