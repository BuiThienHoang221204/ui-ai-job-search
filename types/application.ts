export type ApplicationStatus = "VIEWED" | "APPLIED" | "WITHDRAWN";

export type ApplicationGroup = "open" | "closed";

export interface ApplicationDocument {
  id: string;
  jobId: string | null;
  kind: "CV" | "COVER_LETTER" | "APPLICATION_EMAIL" | "FORM_ANSWER";
  title: string;
  status: string;
  templateId: string;
  generatedAt: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    salaryRaw: string | null;
    url: string;
  };
  documents: ApplicationDocument[];
}

export interface ApplicationList {
  items: Application[];
  total: number;
  limit: number;
  offset: number;
  counts: Record<"all" | ApplicationGroup, number>;
}
