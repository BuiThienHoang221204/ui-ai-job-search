import { responseErrorMessage } from "@/lib/axios";

export class InterviewStreamError extends Error {}

export class InterviewServerError extends InterviewStreamError {}

export interface StreamTurnOptions {
  runId: string;
  answer: string | null;
  onText: (fullText: string) => void;
  signal?: AbortSignal;
}

const API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Mở buổi phỏng vấn thử và nhận câu hỏi đầu tiên theo kiểu chảy dần. */
export async function streamInterviewOpen({
  jobId,
  question,
  onText,
  signal,
  onRunId,
}: {
  jobId: string;
  question?: string;
  onText: (fullText: string) => void;
  signal?: AbortSignal;
  onRunId?: (runId: string) => void;
}): Promise<string> {
  const response = await fetch(`${API}/mock-interviews`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question ? { jobId, question } : { jobId }),
    signal,
  });

  if (!response.ok) {
    throw new InterviewServerError(await responseErrorMessage(response));
  }
  const runId = response.headers.get("X-Run-Id");
  if (runId) onRunId?.(runId);
  if (!response.body) {
    throw new InterviewStreamError("Trình duyệt không đọc được luồng dữ liệu.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      onText(full);
    }
  } catch (cause) {
    throw new InterviewStreamError(
      cause instanceof Error && cause.name === "AbortError"
        ? "Đã dừng."
        : "Kết nối đứt giữa chừng.",
    );
  }

  full += decoder.decode();
  if (!full.trim()) {
    throw new InterviewStreamError("Máy chủ không trả về nội dung nào.");
  }

  onText(full);
  return full;
}

/** Gửi câu trả lời (hoặc `null` để kết thúc sớm), nhận lượt tiếp theo hay lời tổng kết từng mẩu một. */
export async function streamInterviewTurn({
  runId,
  answer,
  onText,
  signal,
}: StreamTurnOptions): Promise<string> {
  const finishing = answer === null;
  const response = await fetch(
    `${API}/mock-interviews/${runId}/${finishing ? "finish" : "turn"}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: finishing ? undefined : JSON.stringify({ text: answer }),
      signal,
    },
  );

  if (!response.ok) {
    throw new InterviewServerError(await responseErrorMessage(response));
  }
  if (!response.body) {
    throw new InterviewStreamError("Trình duyệt không đọc được luồng dữ liệu.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      onText(full);
    }
  } catch (cause) {
    throw new InterviewStreamError(
      cause instanceof Error && cause.name === "AbortError"
        ? "Đã dừng."
        : "Kết nối đứt giữa chừng.",
    );
  }

  full += decoder.decode();
  if (!full.trim()) {
    throw new InterviewStreamError("Máy chủ không trả về nội dung nào.");
  }

  onText(full);
  return full;
}
