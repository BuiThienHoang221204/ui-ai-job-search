import { api } from "@/lib/axios";
import { blobErrorToError, textErrorToError } from "./blob-error";
import type { Paginated, QueuedDocument, WorkStatus } from "./types";
import type { AiFailureKind } from "@/lib/failure-message";

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
  storageKey: string | null;
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

export const documentsService = {
  list: (
    kind?: DocumentKind,
    jobId?: string,
    page?: { limit?: number; offset?: number },
  ) =>
    api
      .get<Paginated<DocumentRecord>>("/documents", {
        params: {
          ...(kind ? { kind } : {}),
          ...(jobId ? { jobId } : {}),
          ...page,
        },
      })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<DocumentRecord>(`/documents/${id}`).then((r) => r.data),

  /** Tải file .tex thô của tài liệu dưới dạng text. */
  source: async (id: string) => {
    try {
      const response = await api.get<string>(`/documents/${id}/source`, {
        responseType: "text",
      });
      return response.data;
    } catch (error) {
      throw textErrorToError(error);
    }
  },

  /** Compile tài liệu ra PDF và trả về Blob, đọc lỗi Blob thành câu thông báo. */
  pdf: async (id: string, engine?: "latex" | "html"): Promise<Blob> => {
    try {
      const response = await api.get<Blob>(`/documents/${id}/pdf`, {
        params: engine ? { engine } : undefined,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw await blobErrorToError(error);
    }
  },

  /** Tạo CV: không có jobId thì sinh CV tổng quát, có thì theo vị trí. */
  createCv: (
    source: CvSourceInput = {},
    stream = false,
    language: CvLanguage = "vi",
  ) =>
    api
      .post<QueuedDocument>("/documents/cv", { ...source, stream, language })
      .then((r) => r.data),

  /** Bóc tin tuyển dụng từ đường dẫn để người dùng soát lại, không tạo tài liệu. */
  extractJobFromUrl: (url: string) =>
    api
      .post<ExtractedJob>("/documents/job-from-url", { url })
      .then((r) => r.data),

  createCoverLetter: (jobId: string, stream = false) =>
    api
      .post<QueuedDocument>("/documents/cover-letter", { jobId, stream })
      .then((r) => r.data),

  /** Tạo mail ứng tuyển gửi nhà tuyển dụng từ tin có sẵn hoặc JD dán tay. */
  createApplicationEmail: (input: ApplicationEmailInput) =>
    api
      .post<QueuedDocument>("/documents/application-email", input)
      .then((r) => r.data),

  /** Lấy danh mục mẫu CV từ backend. */
  cvTemplates: () =>
    api
      .get<{ items: CvTemplate[] }>("/documents/cv-templates")
      .then((r) => r.data.items),

  /** Lấy HTML xem trước bản nháp CV chưa lưu. */
  previewDraft: async (
    id: string,
    draft: {
      content?: CvContentInput;
      layout?: CvLayout;
      identity?: CvIdentityEdit;
      templateId?: string;
      accent?: string;
      font?: CvFont;
      size?: CvFontSize;
      lineHeight?: number;
      editing?: boolean;
    },
  ) => {
    try {
      const response = await api.post<string>(
        `/documents/${id}/preview`,
        draft,
        { responseType: "text" },
      );
      return response.data;
    } catch (error) {
      throw textErrorToError(error);
    }
  },

  /** Lưu bản CV người dùng đã sửa, không tốn lượt gọi model. */
  updateCv: (
    id: string,
    input: {
      content?: CvContentInput;
      layout?: CvLayout;
      identity?: CvIdentityEdit;
    },
  ) =>
    api.put<DocumentRecord>(`/documents/${id}/cv`, input).then((r) => r.data),

  /** Lưu mẫu CV và màu nhấn đã chọn. */
  setTemplate: (
    id: string,
    templateId: string,
    options: CvTypography & { accent?: string },
  ) =>
    api
      .put<DocumentRecord>(`/documents/${id}/template`, {
        templateId,
        ...options,
      })
      .then((r) => r.data),
};
