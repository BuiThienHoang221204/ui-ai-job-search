import { api } from "@/lib/axios";
import type { Application, ApplicationList, ApplicationStatus } from "@/types";

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

  /** Tạo đơn ứng tuyển cho một việc làm, tuỳ chọn bỏ qua sinh tài liệu. */
  create: (jobId: string, options?: { skipDocuments?: boolean }) =>
    api
      .post<Application>("/applications", { jobId, ...options })
      .then((r) => r.data),

  /** Tên tin và công ty của mọi đơn ở một trạng thái, để đổ vào ô chọn. */
  jobs: (status: ApplicationStatus) =>
    api
      .get<
        {
          jobId: string;
          title: string;
          company: string;
          companyLogo: string | null;
        }[]
      >(
        "/applications/jobs",
        { params: { status } },
      )
      .then((r) => r.data),

  /** Cập nhật trạng thái đơn ứng tuyển kèm ghi chú tuỳ chọn. */
  updateStatus: (id: string, status: ApplicationStatus, note?: string) =>
    api
      .put<Application>(`/applications/${id}/status`, { status, note })
      .then((r) => r.data),

  /** Ghi, đổi hoặc xoá (null) ngày phỏng vấn của đơn. */
  setInterviewDate: (id: string, interviewAt: string | null) =>
    api
      .put<Application>(`/applications/${id}/interview-date`, { interviewAt })
      .then((r) => r.data),
};
