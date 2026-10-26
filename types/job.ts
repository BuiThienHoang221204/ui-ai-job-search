import type { AiFailureKind } from "./ai";
import type { WorkStatus } from "./api";
import type { ApplicationStatus } from "./application";

export type SalaryCurrency = "VND" | "USD";
export type SalaryPeriod = "month" | "year";

export interface JobTimestamp {
  label: string;
  source: "posted" | "scraped";
  at: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: SalaryCurrency;
  period: SalaryPeriod;
}

export interface Job {
  id: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  companyLogo: string | null;
  title: string;
  location: string;
  salary: SalaryRange | null;
  salaryRaw?: string | null;
  tags: string[];
  postedAt: JobTimestamp;
  strengths: string[];
  aiMatch: number | null;
  systemMatch: {
    kind: "REQUIREMENTS" | "KEYWORDS";
    met: number;
    total: number;
    percent: number;
  } | null;
  hasAiScore: boolean;
  saved: boolean;
}

export interface JobMatchWithJob {
  jobId: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  eligibility: "PASS" | "FAIL" | "UNVERIFIED" | null;
  eligibilityNote: string | null;
  overallScore: number | null;
  failureKind?: AiFailureKind | null;
  verdict: "STRONG" | "GOOD" | "MODERATE" | "WEAK" | "POOR" | null;
  stale?: boolean;
  technicalScore: number | null;
  experienceScore: number | null;
  behavioralScore?: number | null;
  careerScore?: number | null;
  technicalNote?: string | null;
  experienceNote?: string | null;
  behavioralNote?: string | null;
  careerNote?: string | null;
  strengths: string[];
  gaps: string[];
  recommendation?: string | null;
  evaluatedAt?: string | null;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    salaryRaw: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    tags: string[];
    url: string;
    postedAt: string | null;
    scrapedAt: string;
    saved: boolean;
  };
}

export type JobMatchCard = Pick<
  JobMatchWithJob,
  "jobId" | "status" | "overallScore" | "strengths" | "job"
>;

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
  otherOccupationYears: number | null;
  currentSalaryIgnored: boolean;
}

export type JobRecord = Omit<JobListItem, "match" | "systemMatch"> & {
  systemMatch: SystemMatch | null;
  description: string;
  occupationCode: string | null;
  match: JobMatchDetail | null;
  salaryGuide: SalaryGuide | null;
  application: { id: string; status: ApplicationStatus } | null;
  profileLocation: string | null;
  companyKey: string | null;
  reposts: JobReposts | null;
};
export interface JobReposts {
  count: number;
  firstAt: string;
  dates: string[];
}
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
  followed?: boolean;
  subOccupation?: string[];
  since?: string;
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
export interface PublicJob {
  id: string;
  source: string;
  url: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  workMode: string | null;
  tags: string[];
  postedAt: string | null;
  scrapedAt: string;
  provinceCode: string | null;
  occupationCode: string | null;
}

export interface PublicJobDetail extends PublicJob {
  description: string;
  systemMatch: SystemMatch | null;
}

export type PublicJobListParams = Pick<
  JobListParams,
  | "limit"
  | "offset"
  | "q"
  | "province"
  | "occupation"
  | "subOccupation"
  | "postedWithin"
>;

export interface JobDetailData {
  job: JobRecord;
  match: JobMatchDetail | null;
}

export interface JobFilterValue {
  q: string;
  province: string[];
  occupation: string[];
  salaryMin: number;
  postedWithin: number;
  sort: JobSort;
  saved: boolean;
  applied: boolean;
  followed: boolean;
  subOccupation: string[];
  since: string;
}

export interface PartialEvaluation {
  eligibility?: { verdict?: string; note?: string; quote?: string };
  technical?: { score?: number; note?: string };
  experience?: { score?: number; note?: string };
  behavioral?: { score?: number; note?: string };
  career?: { score?: number; note?: string };
  location?: { pass?: boolean; note?: string };
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
}
