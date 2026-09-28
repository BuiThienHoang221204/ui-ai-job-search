import { api } from "@/lib/axios";

export type CompanyVerdict =
  | "POSITIVE"
  | "MIXED"
  | "NEGATIVE"
  | "NO_REVIEWS_YET"
  | "UNKNOWN";
export type BriefConfidence = "HIGH" | "MEDIUM" | "LOW";

export type SourceStatus = "read" | "snippet" | "unreachable";

export interface BriefSource {
  url: string;
  title: string;
  usedFor: string | null;
  status: SourceStatus;
}

export interface CompanyBriefRecord {
  id: string;
  nameKey: string;
  name: string;
  verdict: CompanyVerdict;
  summary: string;
  pros: string[];
  cons: string[];
  confidence: BriefConfidence;
  rating: number | null;
  reviewCount: number | null;
  sources: BriefSource[];
  modelId: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyBriefView {
  company: string;
  researchable: boolean;
  brief: CompanyBriefRecord | null;
  stale: boolean;
}

export interface BriefQueued {
  queued: boolean;
  company?: string;
  reason?: string;
}

export const companiesService = {
  briefForJob: (jobId: string) =>
    api
      .get<CompanyBriefView>(`/companies/brief/by-job/${jobId}`)
      .then((r) => r.data),

  refreshForJob: (jobId: string, force = false) =>
    api
      .post<BriefQueued>(`/companies/brief/by-job/${jobId}`, { force })
      .then((r) => r.data),
};
