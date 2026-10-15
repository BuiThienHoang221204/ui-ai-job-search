import { api } from "@/lib/axios";
import type { CvUploadReceipt, ProfileDraftRecord } from "@/types";

export const profileDraftService = {
  uploadCv: (file: File, stream = false) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<CvUploadReceipt>(
        `/profile-drafts/cv${stream ? "?stream=true" : ""}`,
        form,
        { headers: { "Content-Type": undefined } },
      )
      .then((r) => r.data);
  },

  latest: () =>
    api.get<ProfileDraftRecord>("/profile-drafts/latest").then((r) => r.data),

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
