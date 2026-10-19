import type { AiFailureKind } from "./ai";
import type { WorkStatus } from "./api";

export type DocumentKind = "CV" | "COVER_LETTER" | "APPLICATION_EMAIL";

export type ApplicationEmailInput =
  | { jobId: string }
  | { jobDescription: string; company: string; title: string };

export type CvSourceInput =
  | { jobId?: string }
  | { jobDescription: string; company: string; title: string };

export interface ExtractedJob {
  company: string;
  title: string;
  description: string;
}

export interface CvContentInput {
  profileStatement: string;
  coreCompetencies: string[];
  experiences: Array<{
    position: string;
    company: string;
    location: string;
    period: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    role: string;
    organization: string;
    period: string;
    description: string;
    bullets: string[];
    tools: string[];
  }>;
  educations: Array<{
    degree: string;
    institution: string;
    period: string;
    detail: string;
  }>;
  skillGroups: Array<{ label: string; items: string[] }>;
}

export type CvLanguage = "vi" | "en";

export type CvFont = "noto-sans" | "noto-serif" | "arial" | "times";

export type CvFontSize = "small" | "medium" | "large";

/** Font, cỡ chữ, khoảng cách dòng người dùng chọn; vắng mặt = theo mẫu. */
export interface CvTypography {
  font?: CvFont;
  size?: CvFontSize;
  lineHeight?: number;
}

/** Phần đầu CV sửa riêng cho một CV; khoá vắng mặt = lấy theo tài khoản/hồ sơ, chuỗi rỗng = ẩn. */
export type CvIdentityEdit = Partial<
  Record<"name" | "email" | "phone" | "location" | "title", string>
>;

export type CvSectionKey =
  | "profile"
  | "competencies"
  | "experience"
  | "projects"
  | "education"
  | "skills";

export interface CvLayout {
  order: CvSectionKey[];
  hidden: CvSectionKey[];
  titles?: Partial<Record<CvSectionKey, string>>;
}

export interface CvTemplate {
  id: string;
  name: string;
  description: string;
  style: "don-gian" | "chuyen-nghiep" | "hien-dai";
  accent: string;
  usesAccent: boolean;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  jobId: string | null;
  kind: DocumentKind;
  status: WorkStatus;
  title: string;
  content: unknown;
  templateId: string;
  templateOptions: (CvTypography & { accent?: string }) | null;
  layout: CvLayout | null;
  identity: CvIdentityEdit | null;
  language: "VI" | "EN";
  modelId: string | null;
  generatedAt: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
  } | null;
}

export interface PartialCv {
  profileStatement?: string;
  coreCompetencies?: string[];
  experiences?: Array<{
    position?: string;
    company?: string;
    bullets?: string[];
  }>;
  projects?: Array<{ name?: string; bullets?: string[] }>;
  educations?: Array<{ degree?: string; institution?: string }>;
  skillGroups?: Array<{ label?: string; items?: string[] }>;
}
