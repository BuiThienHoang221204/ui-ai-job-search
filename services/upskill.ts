import { api } from "@/lib/axios";
import type { QueuedReport, UpskillInFlight, UpskillReportRecord } from "@/types";

export const upskillService = {
  latest: () => api.get<UpskillReportRecord>("/upskill").then((r) => r.data),

  /** Lượt phân tích đang chạy; backend trả thân rỗng khi không có. */
  inFlight: () =>
    api.get<UpskillInFlight | "">("/upskill/in-flight").then((r) => r.data || null),

  get: (id: string) =>
    api.get<UpskillReportRecord>(`/upskill/${id}`).then((r) => r.data),

  /** Tạo báo cáo nâng cấp kỹ năng: có jobId thì TARGETED, không thì AGGREGATE. */
  generate: (jobId?: string) =>
    api.post<QueuedReport>("/upskill/generate", { jobId }).then((r) => r.data),
};
