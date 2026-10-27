import { api, apiErrorStatus } from "@/lib/axios";
import type { CvUploadReceipt, ProfileDraftRecord } from "@/types";

export const profileDraftService = {
  /** Tải CV thẳng lên kho lưu trữ qua URL ký sẵn (byte không đi qua máy chủ), rồi báo máy chủ đọc file đó. */
  uploadCv: async (file: File, stream = false) => {
    const { key, url } = await api
      .post<{ key: string; url: string }>("/profile-drafts/cv/upload-url")
      .then((r) => r.data);
    const put = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "application/pdf" },
    });
    if (!put.ok)
      throw new Error(`Tải file lên kho lưu trữ hỏng: ${put.status}`);
    return api
      .post<CvUploadReceipt>(
        `/profile-drafts/cv${stream ? "?stream=true" : ""}`,
        { key, filename: file.name },
      )
      .then((r) => r.data);
  },

  latest: () =>
    api.get<ProfileDraftRecord>("/profile-drafts/latest").then((r) => r.data),

  /** Bản đọc CV gần nhất; chưa tải CV nào (404) thì là `null`, lỗi khác vẫn ném ra. */
  latestOrNull: () =>
    profileDraftService.latest().catch((err: unknown) => {
      if (apiErrorStatus(err) === 404) return null;
      throw err;
    }),

  get: (id: string) =>
    api.get<ProfileDraftRecord>(`/profile-drafts/${id}`).then((r) => r.data),

  /** Trả về link mở file CV gốc của bản nháp trong tab mới. */
  fileUrl: (id: string) => `${api.defaults.baseURL}/profile-drafts/${id}/file`,

  /** Chạy lại bản nháp FAILED từ bằng chứng đã lưu, không cần nộp lại file. */
  retry: (id: string) =>
    api
      .post<ProfileDraftRecord>(`/profile-drafts/${id}/retry`)
      .then((r) => r.data),

  /** Lưu vào hồ sơ đúng những giá trị người dùng đã duyệt từ bản đọc này. */
  apply: (id: string, values: Record<string, unknown>) =>
    api
      .put<ProfileDraftRecord>(`/profile-drafts/${id}/apply`, values)
      .then((r) => r.data),
};
