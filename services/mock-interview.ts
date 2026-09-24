import { api } from "@/lib/axios";
import type { Paginated } from "./types";
import type { AiFailureKind } from "@/lib/failure-message";

/**
 * Trạng thái một lượt chạy agent.
 *
 * Khác `WorkStatus` đúng một giá trị, và đó là khác biệt về bản chất:
 * `WAITING_USER` nghĩa là agent đã dừng giữa chừng để hỏi, và nó sẽ nằm im như
 * vậy cho tới khi người dùng trả lời — có thể là vài giờ sau.
 */
export type MockInterviewStatus =
  | "PENDING"
  | "RUNNING"
  | "WAITING_USER"
  | "DONE"
  | "FAILED";

/** Một bước: model gọi tool nào, tool trả về gì. */
export interface InterviewStep {
  id: string;
  index: number;
  text: string;
  toolCalls: Array<{ tool: string; input: unknown }>;
  toolResults: Array<{ tool: string; output: unknown }>;
  durationMs: number;
  createdAt: string;
}

/**
 * Thứ agent ghi ra trong lượt chạy.
 *
 * Hai loại, và giao diện phải mở chúng theo hai đường khác nhau: có
 * `documentId` thì đây là một `Document` thật - sửa được, đổi mẫu được, tải
 * PDF được; không có thì là một file rời trong Storage, chỉ đọc được chữ.
 */

export interface MockInterviewRecord {
  id: string;
  workflow: string;
  status: MockInterviewStatus;
  /** Tin tuyển dụng buổi luyện này nhắm tới. */
  jobId: string | null;
  /**
   * Chỉ buổi luyện chạy qua vòng lặp agent CŨ mới có. Bản ghi mới không ghi
   * trường này, nhưng buổi cũ trong database vẫn đọc ra được lời tổng kết.
   */
  result: { text?: string } | null;
  /** Có giá trị khi và chỉ khi status là WAITING_USER. */
  question: string | null;
  answer: string | null;
  modelId: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  finishedAt: string | null;
  steps: InterviewStep[];
}

/** Dòng trong danh sách: không kèm `steps`, chỉ đếm. */
export interface MockInterviewSummary {
  id: string;
  workflow: string;
  status: MockInterviewStatus;
  question: string | null;
  modelId: string | null;
  failureKind: AiFailureKind | null;
  createdAt: string;
  finishedAt: string | null;
  jobId: string | null;
  /** `null` khi tin tuyển dụng đã bị dọn đi; lượt chạy thì vẫn còn. */
  job: { title: string; company: string } | null;
  _count: { steps: number };
}

/** Bộ lọc danh sách lượt chạy. Bỏ trống thì lấy mọi lượt của người dùng. */
export type MockInterviewListQuery = {
  limit?: number;
  offset?: number;
  jobId?: string;
  workflow?: string;
};

/**
 * Đường ĐỌC của buổi luyện phỏng vấn.
 *
 * Phần chạy thật đi bằng `lib/interview-stream.ts` với `fetch` thô, không qua
 * axios: hai đường `open-stream` và `:id/turn` trả chữ chảy dần chứ không trả
 * JSON, mà axios thì đợi cả phản hồi rồi mới giao.
 */
export const mockInterviewService = {
  get: (id: string) =>
    api.get<MockInterviewRecord>(`/mock-interviews/${id}`).then((r) => r.data),

  list: (query?: MockInterviewListQuery) =>
    api
      .get<Paginated<MockInterviewSummary>>("/mock-interviews", { params: query })
      .then((r) => r.data),
};
