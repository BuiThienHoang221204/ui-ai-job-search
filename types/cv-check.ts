export interface CvCheckItem {
  key: string;
  group: "ats" | "content" | "structure";
  label: string;
  earned: number;
  max: number;
  detail: string;
  sample: string | null;
}

export interface CvCheckGroup {
  key: CvCheckItem["group"];
  label: string;
  earned: number;
  max: number;
}

export type CvReviewSection =
  | "contact"
  | "summary"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications";

export type CvAtsCheck =
  "readingOrder" | "headings" | "dates" | "jobTitles" | "spelling";

export interface CvReviewIssue {
  title: string;
  impact: "ats" | "recruiter" | "both";
  why: string;
  quote: string | null;
  rewrite: string | null;
}

export interface CvReview {
  summary: string;
  targetRole: string;
  level:
    "intern" | "fresher" | "junior" | "middle" | "senior" | "lead" | "unknown";
  sections: Array<{
    section: CvReviewSection;
    verdict: "ok" | "fix" | "missing";
    note: string;
    issues: CvReviewIssue[];
  }>;
  ats: Array<{
    key: CvAtsCheck;
    status: CvCheckStatus;
    note: string;
  }>;
  strengths: string[];
  improvements: string[];
  questions: Array<{
    question: string;
    topic: string;
    level: "basic" | "intermediate" | "advanced";
    why: string;
    hint: string;
  }>;
  parsed?: {
    name: string | null;
    email: string | null;
    phone: string | null;
    jobs: Array<{
      title: string;
      company: string | null;
      dates: string | null;
    }>;
    education: Array<{
      school: string;
      degree: string | null;
      dates: string | null;
    }>;
    skills: string[];
  };
}

export type CvCheckPhase = "idle" | "reading" | "scoring";

export type CvCheckStatus = "pass" | "warn" | "fail";

export interface CvCheckSource {
  name: string;
  file: File | null;
  pages: number | null;
  multiColumn: boolean | null;
}

export type CvCheckReason =
  "no-text" | "guest-limit" | "daily-limit" | "ai-failed";

export interface CvCheckResult {
  score: number;
  groups: CvCheckGroup[];
  checks: CvCheckItem[];
  flags: CvCheckItem[];
  mode: "ai" | "quick";
  reason: CvCheckReason | null;
  review: CvReview | null;
  aiRemaining: number | null;
}
