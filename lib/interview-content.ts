import { isRecord, objectList, text } from "./parse-json";
import type { InterviewPrepRecord } from "@/services";

export interface StarAnswer {
  competency: string | null;
  question: string | null;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
}

export interface ToughQuestion {
  question: string;
  why: string | null;
  suggestedAnswer: string | null;
}

/** Đọc một câu trả lời STAR từ JSON của model, hỏng thì trả null. */
function parseStarAnswer(value: unknown): StarAnswer | null {
  if (!isRecord(value)) return null;
  const answer: StarAnswer = {
    competency: text(value.competency),
    question: text(value.question),
    situation: text(value.situation),
    task: text(value.task),
    action: text(value.action),
    result: text(value.result),
  };
  return answer.question || answer.competency ? answer : null;
}

/** Đọc một câu hỏi khó từ JSON của model, hỏng thì trả null. */
function parseToughQuestion(value: unknown): ToughQuestion | null {
  if (!isRecord(value)) return null;
  const question = text(value.question);
  if (!question) return null;
  return {
    question,
    why: text(value.why),
    suggestedAnswer: text(value.suggestedAnswer),
  };
}

/** Đọc danh sách câu trả lời STAR, bỏ các phần tử hỏng. */
export function parseStarAnswers(value: unknown): StarAnswer[] {
  return objectList(value, parseStarAnswer);
}

/** Đọc danh sách câu hỏi khó, bỏ các phần tử hỏng. */
export function parseToughQuestions(value: unknown): ToughQuestion[] {
  return objectList(value, parseToughQuestion);
}

/** Gom bộ câu hỏi đọc được từ một bản ghi chuẩn bị phỏng vấn. */
export function interviewQuestions(prep: InterviewPrepRecord): string[] {
  const fromStar = parseStarAnswers(prep.starAnswers)
    .map((answer) => answer.question)
    .filter((question): question is string => question !== null);
  const fromTough = parseToughQuestions(prep.toughQuestions).map(
    (item) => item.question,
  );

  return [...new Set([...fromStar, ...fromTough])];
}

/** Bản ghi chuẩn bị phỏng vấn đã DONE nhưng không đọc được gì dùng được. */
export function isInterviewPrepEmpty(prep: InterviewPrepRecord): boolean {
  return (
    parseStarAnswers(prep.starAnswers).length === 0 &&
    parseToughQuestions(prep.toughQuestions).length === 0 &&
    prep.questionsToAsk.length === 0 &&
    prep.talkingPoints.length === 0 &&
    prep.likelyProbes.length === 0
  );
}
