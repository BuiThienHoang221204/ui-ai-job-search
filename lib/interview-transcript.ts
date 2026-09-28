import type { MockInterviewRecord, InterviewStep } from "@/services";

const ASK_USER = "ask_user";

export interface InterviewTurn {
  index: number;
  question: string;
  answer: string | null;
  feedback: string | null;
}

export interface InterviewTranscript {
  intro: string | null;
  turns: InterviewTurn[];
  closing: string | null;
}

type AskUserOutput = { asked?: unknown; answer?: unknown };

/** Chuỗi đã cắt khoảng trắng, rỗng hoặc không phải chuỗi thì trả null. */
const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/** Câu hỏi mà bước này đặt ra, hoặc `null` nếu nó không hỏi gì. */
function questionOf(step: InterviewStep): string | null {
  const call = step.toolCalls?.find((entry) => entry.tool === ASK_USER);
  if (!call) return null;
  return text((call.input as { question?: unknown } | undefined)?.question);
}

/** Câu người dùng đã trả lời cho bước đó — backend ghi ngược vào `toolResults`. */
function answerOf(step: InterviewStep): string | null {
  const result = step.toolResults?.find((entry) => entry.tool === ASK_USER);
  if (!result) return null;
  return text((result.output as AskUserOutput | undefined)?.answer);
}

/** Dựng biên bản buổi luyện phỏng vấn từ nhật ký các bước. */
export function buildTranscript(run: MockInterviewRecord): InterviewTranscript {
  const turns: InterviewTurn[] = [];
  let intro: string | null = null;

  for (const step of run.steps ?? []) {
    const said = text(step.text);
    if (said) {
      const last = turns.at(-1);
      if (last) last.feedback = last.feedback ? `${last.feedback}\n\n${said}` : said;
      else intro = intro ? `${intro}\n\n${said}` : said;
    }

    const question = questionOf(step);
    if (!question) continue;

    turns.push({
      index: turns.length + 1,
      question,
      answer: answerOf(step),
      feedback: null,
    });
  }

  const closing = run.status === "DONE" ? text(run.result?.text) : null;

  return { intro, turns, closing };
}

/** Lượt đang chờ người dùng trả lời, nếu có. */
export function pendingTurn(
  transcript: InterviewTranscript,
): InterviewTurn | null {
  const last = transcript.turns.at(-1);
  return last && last.answer === null ? last : null;
}
