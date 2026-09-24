import { failureMessage, type AiFailureKind } from "@/lib/failure-message";

export class ModelStreamError extends Error {}

export type ModelStreamEvent<T> =
  | { type: "partial"; data: unknown }
  | { type: "done"; result: T }
  | { type: "error"; message: string; failureKind?: AiFailureKind };

export interface StreamModelOptions<P> {
  path: string;
  onPartial: (partial: P) => void;
  force?: boolean;
  signal?: AbortSignal;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Đếm từ lần NHẬN CUỐI, không phải từ lúc bắt đầu. Server đập nhịp mỗi 10 giây (`HEARTBEAT_MS` trong `common/ndjson.ts`) nên im quá 40 giây là chết thật — đổi một bên phải đổi bên kia. */
const IDLE_TIMEOUT_MS = 40_000;

export async function streamModel<T, P = unknown>({
  path,
  onPartial,
  force = false,
  signal,
}: StreamModelOptions<P>): Promise<T> {
  const query = force ? "?force=true" : "";
  const response = await fetch(`${API}${path}${query}`, {
    method: "POST",
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new ModelStreamError(
      response.status === 401
        ? "Phiên đăng nhập đã hết hạn."
        : `Máy chủ trả về HTTP ${response.status}`,
    );
  }
  if (!response.body) {
    throw new ModelStreamError("Trình duyệt không đọc được luồng dữ liệu.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done: T | null = null;

  const take = (line: string) => {
    if (!line.trim()) return;
    let event: ModelStreamEvent<T>;
    try {
      event = JSON.parse(line) as ModelStreamEvent<T>;
    } catch {
      return;
    }
    if (event.type === "partial") onPartial(event.data as P);
    else if (event.type === "done") done = event.result;
    // Có failureKind nghĩa là lỗi AI đã được phân loại; không có là câu server cố ý nói với người dùng.
    else
      throw new ModelStreamError(
        event.failureKind ? failureMessage(event.failureKind) : event.message,
      );
  };

  /** `reader.read()` không nhận `AbortSignal`, nên chạy đua nó với một đồng hồ. */
  const readOrGiveUp = async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const giveUp = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new ModelStreamError(
              "Máy chủ ngừng phản hồi. Hãy thử lại sau ít phút.",
            ),
          ),
        IDLE_TIMEOUT_MS,
      );
    });
    try {
      return await Promise.race([reader.read(), giveUp]);
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    for (;;) {
      const chunk = await readOrGiveUp();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      let at = buffer.indexOf("\n");
      while (at >= 0) {
        take(buffer.slice(0, at));
        buffer = buffer.slice(at + 1);
        at = buffer.indexOf("\n");
      }
    }
  } catch (cause) {
    if (cause instanceof ModelStreamError) throw cause;
    throw new ModelStreamError(
      cause instanceof Error && cause.name === "AbortError"
        ? "Đã dừng."
        : "Kết nối đứt giữa chừng.",
    );
  }

  buffer += decoder.decode();
  take(buffer);

  if (!done) {
    throw new ModelStreamError("Luồng kết thúc mà không có kết quả cuối.");
  }
  return done;
}
