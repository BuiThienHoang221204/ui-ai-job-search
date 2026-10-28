import { api } from "@/lib/axios";
import type { CvCheckResult } from "@/types";

export const cvCheckService = {
  /** Phân tích CV từ chữ đã đọc ở trình duyệt; khách gọi được, không cần đăng nhập. */
  check: (input: { text: string; pages: number; pagesRead: number }) =>
    api.post<CvCheckResult>("/cv-check", input).then((r) => r.data),
};
