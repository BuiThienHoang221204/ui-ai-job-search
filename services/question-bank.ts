import { api } from "@/lib/axios";

export type QuestionType = "KIEN_THUC" | "QUY_TRINH" | "HANH_VI" | "DONG_CO";

export interface QuestionSummary {
  id: string;
  text: string;
  industry: string | null;
  industryName: string | null;
  type: QuestionType | null;
  typeName: string | null;
  difficulty: string | null;
  /** `null` = chưa ai mở câu này, đáp án sẽ được sinh ở lần mở đầu tiên. */
  answeredAt: string | null;
  /** `false` với câu hành vi và động cơ — đáp án phải là trải nghiệm của chính ứng viên. */
  canHaveSampleAnswer: boolean;
}

export interface QuestionDetail extends QuestionSummary {
  why: string | null;
  keyPoints: string[];
  answerGuide: string | null;
  sampleAnswer: string | null;
  /** Đáp án do model sinh và chưa có người rà. Giao diện PHẢI nói rõ điều này. */
  verified: boolean;
}

export interface QuestionFacets {
  total: number;
  industries: { code: string; name: string; count: number }[];
  types: { code: string; name: string; count: number }[];
  difficulties: { name: string; count: number }[];
}

export interface QuestionPage {
  total: number;
  limit: number;
  offset: number;
  items: QuestionSummary[];
}

export interface QuestionFilters {
  industry?: string;
  type?: string;
  difficulty?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

/**
 * `BACKEND_URL` chứ KHÔNG phải `NEXT_PUBLIC_API_URL` — cùng lý do đã ghi ở
 * `services/salary.ts`: biến public là đường dẫn tương đối, chỉ có nghĩa trong
 * trình duyệt, dùng ở server thì `fetch` ném "Failed to parse URL".
 */
const API = `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api`;

function query(filters: QuestionFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Gọi từ SERVER COMPONENT. Ba route đọc đều công khai nên không cần cookie. */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Question bank API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const questionBankService = {
  facets: (filters: QuestionFilters = {}) =>
    get<QuestionFacets>(`/question-bank/filters${query(filters)}`),

  /** Số đếm phía trình duyệt, gọi lại mỗi lần đổi bộ lọc. */
  browseFacets: (filters: QuestionFilters = {}) =>
    api
      .get<QuestionFacets>(`/question-bank/filters${query(filters)}`)
      .then((r) => r.data),

  list: (filters: QuestionFilters = {}) =>
    get<QuestionPage>(`/question-bank${query(filters)}`),

  /** Đường ĐỌC phía trình duyệt, dùng khi người dùng đổi bộ lọc. */
  browse: (filters: QuestionFilters = {}) =>
    api
      .get<QuestionPage>(`/question-bank${query(filters)}`)
      .then((r) => r.data),

  /**
   * Lấy câu hỏi kèm đáp án, SINH nếu chưa có.
   *
   * Đây là đường duy nhất tốn một lượt gọi model, nên nó cần đăng nhập và có thể
   * mất vài chục giây ở lần đầu. Lần sau đọc thẳng từ database.
   */
  answer: (id: string) =>
    api
      .post<QuestionDetail>(`/question-bank/${encodeURIComponent(id)}/answer`)
      .then((r) => r.data),
};
