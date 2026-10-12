import type { ApplicationStatus, JobMatchWithJob } from "@/types";
import { api } from "@/lib/axios";
import type { Paginated, WorkStatus } from "./types";

export interface JobMatchState {
  status: WorkStatus;
  overallScore: number | null;
  verdict: JobMatchWithJob["verdict"];
}

export interface RequirementCheck {
  label: string;
  kind: "SKILL" | "NICE" | "YEARS" | "ELIGIBILITY" | "LOCATION";
  met: boolean | null;
  note?: string;
  via?: string;
}
export interface SystemMatch {
  kind: "REQUIREMENTS" | "KEYWORDS";
  met: number;
  total: number;
  skillMet?: number;
  skillTotal?: number;
  score: number;
  eligibility: "PASS" | "FAIL" | "UNVERIFIED";
  checks: RequirementCheck[];
}
export type JobListItem = JobMatchWithJob["job"] & {
  source: string;
  workMode: string | null;
  match: JobMatchState | null;
  systemMatch: Omit<SystemMatch, "checks"> | null;
};
export type JobMatchDetail = Omit<JobMatchWithJob, "job">;
export type SalaryBasis = "POSITION" | "SUB_OCCUPATION";

export interface SalaryGuide {
  floor: number;
  target: number;
  ceiling: number;
  currency: string;
  basis: SalaryBasis;
  label: string;
  positionCount: number;
  experienceLabel: string | null;
  experienceSource: "PROFILE" | "POSTING" | null;
  candidateYears: number | null;
  requiredYears: number | null;
  experienceGap: boolean;
  anchoredOnCurrentSalary: boolean;
  cappedByPosting: boolean;
  expectedSalary: number | null;
  expectedAboveCeiling: boolean;
  expectedBelowFloor: boolean;
  positionSlug: string | null;
}

export type JobRecord = Omit<JobListItem, "match" | "systemMatch"> & {
  systemMatch: SystemMatch | null;
  description: string;
  occupationCode: string | null;
  match: JobMatchDetail | null;
  salaryGuide: SalaryGuide | null;
  application: { id: string; status: ApplicationStatus } | null;
  profileLocation: string | null;
};
export type JobSort = "newest" | "salary" | "match";
export interface JobListParams {
  limit?: number;
  offset?: number;
  q?: string;
  province?: string[];
  occupation?: string[];
  workMode?: string[];
  salaryMin?: number;
  postedWithin?: number;
  sort?: JobSort;
  scored?: boolean;
  saved?: boolean;
  applied?: boolean;
}
export interface FilterOption {
  code: string;
  name: string;
  count: number;
}

export interface OccupationOption extends FilterOption {
  subs?: FilterOption[];
}

export interface JobFilters {
  provinces: FilterOption[];
  occupations: OccupationOption[];
  remote: FilterOption;
}
export const jobsService = {
  list: (params?: JobListParams) =>
    api
      .get<Paginated<JobListItem> & { needsOccupation?: boolean }>("/jobs", { params })
      .then((r) => r.data),
  filters: () => api.get<JobFilters>("/jobs/filters").then((r) => r.data),

  get: (id: string) => api.get<JobRecord>(`/jobs/${id}`).then((r) => r.data),

  save: (id: string) =>
    api.post<{ saved: true }>(`/jobs/${id}/save`).then((r) => r.data),

  unsave: (id: string) =>
    api.delete<{ saved: false }>(`/jobs/${id}/save`).then((r) => r.data),
};
