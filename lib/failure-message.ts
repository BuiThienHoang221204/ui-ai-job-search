export type AiFailureKind = "SCHEMA" | "TIMEOUT" | "UPSTREAM" | "OTHER";

const MESSAGES: Record<AiFailureKind, string> = {
  SCHEMA:
    "Model trả về kết quả không đúng cấu trúc sau nhiều lần thử. Đây là lỗi của hệ thống, không phải do dữ liệu của bạn — hãy báo lại để được kiểm tra.",
  TIMEOUT:
    "Quá thời gian chờ khi gọi AI. Hệ thống đang chậm hơn bình thường — hãy thử lại sau vài phút.",
  UPSTREAM:
    "Nhà cung cấp AI đang từ chối yêu cầu, thường là do quá tải hoặc đã đạt giới hạn lượt gọi. Hãy thử lại sau vài phút.",
  OTHER: "Không hoàn thành được tác vụ. Hãy thử lại; nếu vẫn lỗi thì báo lại.",
};

/** Câu tiếng Việt giải thích vì sao lượt AI hỏng, theo loại lỗi. */
export function failureMessage(kind?: AiFailureKind | null): string {
  if (!kind) {
    return "Tác vụ thất bại nhưng hệ thống không ghi được lý do. Hãy thử lại.";
  }
  return MESSAGES[kind] ?? MESSAGES.OTHER;
}

/** Có nên mời người dùng bấm thử lại hay không. */
export function isWorthRetrying(kind?: AiFailureKind | null): boolean {
  return kind !== "SCHEMA";
}
