import { api } from "@/lib/axios";
import type { QueuedReport, UpskillReportRecord } from "@/types";

export const upskillService = {
  latest: () => api.get<UpskillReportRecord>("/upskill").then((r) => r.data),

  get: (id: string) =>
    api.get<UpskillReportRecord>(`/upskill/${id}`).then((r) => r.data),

  /** Tạo báo cáo nâng cấp kỹ năng: có jobId thì TARGETED, không thì AGGREGATE. */
  generate: (jobId?: string) =>
    api.post<QueuedReport>("/upskill/generate", { jobId }).then((r) => r.data),
};
