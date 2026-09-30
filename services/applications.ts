import type {
  Application,
  ApplicationList,
  ApplicationStatus,
} from "@/types";
import { api } from "@/lib/axios";

export const applicationsService = {
  /** Lấy danh sách đơn ứng tuyển, lọc theo trạng thái ở backend. */
  list: (
    page?: { limit?: number; offset?: number },
    status?: ApplicationStatus,
  ) =>
    api
      .get<ApplicationList>("/applications", {
        params: {
          ...(status ? { status } : {}),
          ...page,
        },
      })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<Application>(`/applications/${id}`).then((r) => r.data),

  /** Tạo đơn ứng tuyển cho một việc làm, tuỳ chọn bỏ qua sinh tài liệu hoặc chọn CV. */
  create: (jobId: string, options?: { skipDocuments?: boolean; cvDocumentId?: string }) =>
    api
      .post<Application>("/applications", { jobId, ...options })
      .then((r) => r.data),

  /** Cập nhật trạng thái đơn ứng tuyển kèm ghi chú tuỳ chọn. */
  updateStatus: (id: string, status: ApplicationStatus, note?: string) =>
    api
      .put<Application>(`/applications/${id}/status`, { status, note })
      .then((r) => r.data),
};
