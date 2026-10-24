import { describe, expect, it } from "vitest";
import { closeUtterance, endDecision } from "@/lib/voice-turns";

const LONG_ANSWER =
  "Dạ em có khoảng hai năm làm Full Stack với React NestJS và PostgreSQL ạ";

describe("closeUtterance", () => {
  it("câu hỏi mới đóng lượt cũ đã có câu trả lời để lưu", () => {
    const result = closeUtterance(
      { question: "Bạn giới thiệu bản thân?", answer: " Em là dev. " },
      "Cảm ơn bạn. Bạn đáp ứng Vue.js thế nào?",
    );

    expect(result.save).toEqual({
      question: "Bạn giới thiệu bản thân?",
      answer: "Em là dev.",
    });
    expect(result.pending).toEqual({
      question: "Cảm ơn bạn. Bạn đáp ứng Vue.js thế nào?",
      answer: "",
    });
  });

  it("câu đệm của AI sau câu trả lời ngắn thì giữ nguyên lượt đang hỏi", () => {
    const pending = { question: "Bạn đáp ứng Vue.js thế nào?", answer: "Để em nghĩ một chút." };

    const result = closeUtterance(pending, "Bạn cứ từ từ suy nghĩ nhé.");

    expect(result).toEqual({ save: null, pending });
  });

  it("câu trả lời đã đủ dài thì lượt AI kế tiếp là câu mới dù không có dấu hỏi", () => {
    const result = closeUtterance(
      { question: "Kể về dự án gần nhất?", answer: LONG_ANSWER },
      "Rất tốt. Hãy kể về cách bạn triển khai CI/CD.",
    );

    expect(result.save?.answer).toBe(LONG_ANSWER);
    expect(result.pending?.question).toBe(
      "Rất tốt. Hãy kể về cách bạn triển khai CI/CD.",
    );
  });

  it("AI hỏi lại khi chưa có câu trả lời thì thay câu hỏi, không lưu gì", () => {
    const result = closeUtterance(
      { question: "Câu cũ?", answer: "" },
      "Bạn có kinh nghiệm với SQL Server chưa?",
    );

    expect(result.save).toBeNull();
    expect(result.pending?.question).toBe(
      "Bạn có kinh nghiệm với SQL Server chưa?",
    );
  });
});

describe("endDecision", () => {
  it("ứng viên xin dừng thì luôn cho kết thúc", () => {
    expect(endDecision("candidate_stop", 1)).toEqual({ ok: true });
  });

  it("model tự cho là đủ khi chưa có 8 câu trả lời thật thì bị từ chối", () => {
    expect(endDecision("covered", 5).ok).toBe(false);
    expect(endDecision("covered", 8)).toEqual({ ok: true });
  });
});
