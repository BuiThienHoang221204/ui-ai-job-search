import type { AiFailureKind } from "@/lib/failure-message";

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
  strengths: string[];
  gaps: string[];
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

export interface AiMatchDetail {
  overall: number;
  criteria: {
    skills: number;
    experience: number;
    projects: number;
    level: number;
    salaryLocation: number;
  };
  strengths: string[];
  improvements: string[];
  jdSummary: {
    about: string;
    responsibilities: string[];
    requirements: string[];
  };
}
