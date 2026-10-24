import type { VoiceTurnDraft } from "@/types";

const MIN_VOICE_ANSWERS = 8;

const SUBSTANTIAL_WORDS = 12;

export const isSubstantial = (answer: string) =>
  answer.trim().split(/\s+/).length >= SUBSTANTIAL_WORDS;

/** AI vừa nói xong một lượt: là câu hỏi mới (có dấu hỏi, hoặc lượt trước đã được trả lời đủ) thì đóng lượt cũ để lưu; câu đệm như "bạn cứ từ từ" thì giữ nguyên lượt đang hỏi. */
export function closeUtterance(
  pending: VoiceTurnDraft | null,
  utterance: string,
): { save: VoiceTurnDraft | null; pending: VoiceTurnDraft | null } {
  const said = utterance.trim();
  if (!said) return { save: null, pending };
  if (!pending) return { save: null, pending: { question: said, answer: "" } };

  const newQuestion = said.includes("?") || isSubstantial(pending.answer);
  if (!newQuestion) return { save: null, pending };

  const answered = pending.answer.trim();
  return {
    save: answered ? { question: pending.question, answer: answered } : null,
    pending: { question: said, answer: "" },
  };
}

/** Trả lời công cụ `end_interview`: ứng viên xin dừng thì luôn cho dừng; model tự cho là đủ thì phải có ít nhất 8 câu trả lời thật. */
export function endDecision(
  reason: unknown,
  answered: number,
): { ok: boolean; message?: string } {
  if (reason === "candidate_stop" || answered >= MIN_VOICE_ANSWERS) {
    return { ok: true };
  }
  return {
    ok: false,
    message: `Mới có ${answered} câu trả lời thật, cần ít nhất ${MIN_VOICE_ANSWERS}. Chưa kết thúc: hỏi tiếp một yêu cầu chính của tin chưa được hỏi.`,
  };
}
