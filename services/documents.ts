import { api } from "@/lib/axios";
import { blobErrorToError, textErrorToError } from "@/lib/blob-error";
import type {
  ApplicationEmailInput,
  CvContentInput,
  CvFont,
  CvFontSize,
  CvIdentityEdit,
  CvLanguage,
  CvLayout,
  CvSourceInput,
  CvTemplate,
  CvTypography,
  DocumentKind,
  DocumentRecord,
  ExtractedJob,
  Paginated,
  QueuedDocument,
} from "@/types";

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

  /** Compile tài liệu ra PDF và trả về Blob, đọc lỗi Blob thành câu thông báo. */
  pdf: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get<Blob>(`/documents/${id}/pdf`, {
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
