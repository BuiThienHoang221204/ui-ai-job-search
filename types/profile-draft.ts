import type { AiFailureKind } from "./ai";
import type { WorkStatus } from "./api";

export interface ProposedExperience {
  company: string;
  position: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface ProposedEducation {
  school: string;
  degree: string;
  field: string;
  period?: string;
  gpa?: string;
}

export interface ProposedCertificate {
  name: string;
  issuer?: string;
  year?: string;
}

export interface ProposedProject {
  name: string;
  description: string;
  technologies: string[];
  period?: string;
}

export interface ProfileProposal {
  headline?: string;
  location?: string;
  country?: string;
  summary?: string;
  languages: string[];
  primarySkills: string[];
  secondarySkills: string[];
  directExperienceDomains: string[];
  adjacentExperience: string[];
  experiences: ProposedExperience[];
  educations: ProposedEducation[];
  certificates: ProposedCertificate[];
  projects: ProposedProject[];
  missing: string[];
  notes: string[];
}

export interface ProfileDraftRecord {
  id: string;
  status: WorkStatus;
  proposal: ProfileProposal | null;
  filename: string | null;
  storageKey: string | null;
  modelId: string | null;
  generatedAt: string | null;
  appliedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  updatedAt: string;
}

export interface CvUploadReceipt {
  draftId: string;
  queued: boolean;
  extracted: Array<Record<string, string | number | boolean>>;
}

export interface PartialProposal {
  headline?: string;
  summary?: string;
  primarySkills?: string[];
  secondarySkills?: string[];
  experiences?: Array<{ position?: string; company?: string }>;
  educations?: Array<{ degree?: string; institution?: string }>;
}
