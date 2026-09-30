import type { QueryClient } from "@tanstack/react-query";

export const keys = {
  authMe: () => ["auth", "me"] as const,

  dashboard: () => ["dashboard", "overview"] as const,

  jobs: () => ["jobs"] as const,
  jobList: (filter: unknown) => ["jobs", "list", filter] as const,
  jobLists: () => ["jobs", "list"] as const,
  jobFilters: () => ["jobs", "filters"] as const,
  job: (jobId: string) => ["job", jobId] as const,
  jobRecord: (jobId: string) => ["job", jobId, "record"] as const,
  companyBrief: (jobId: string) => ["company-brief", jobId] as const,

  matches: () => ["matches"] as const,
  matchList: (limit: number) => ["matches", "list", limit] as const,
  matchPage: (limit: number, offset: number) =>
    ["matches", "page", limit, offset] as const,

  applications: () => ["applications"] as const,
  applicationList: (status: string, offset: number) =>
    ["applications", "list", status, offset] as const,

  profile: () => ["profile"] as const,

  documents: () => ["documents"] as const,
  documentList: (kind: string, jobId: string | null, offset: number) =>
    ["documents", kind, jobId, offset] as const,
  cvTemplates: () => ["cv-templates"] as const,
  cvPreview: (draftKey: string) => ["cv-preview", draftKey] as const,

  interview: () => ["interview"] as const,
  interviewList: (offset: number) => ["interview", "list", offset] as const,

  upskill: () => ["upskill", "latest"] as const,

  mockInterviews: () => ["mock-interviews"] as const,
  mockInterviewList: (scope: unknown) =>
    ["mock-interviews", "list", scope] as const,
} as const;

const AFFECTED: Record<string, readonly (readonly string[])[]> = {
  saveJob: [keys.jobs(), ["job"]],
  applicationStatus: [keys.applications(), keys.dashboard()],
  saveProfile: [keys.profile(), keys.dashboard()],
  createDocument: [keys.documents()],
  scoreJob: [keys.matches(), keys.jobs(), ["job"], keys.dashboard()],
  mockInterview: [keys.mockInterviews()],
};

export type WriteAction = keyof typeof AFFECTED;

/** Xoá cache mọi nhóm truy vấn mà một hành động ghi làm cũ. */
export function invalidateAfter(
  client: QueryClient,
  action: WriteAction,
): void {
  for (const queryKey of AFFECTED[action]) {
    void client.invalidateQueries({ queryKey });
  }
}
