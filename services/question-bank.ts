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
  answeredAt: string | null;
  canHaveSampleAnswer: boolean;
}

export interface QuestionDetail extends QuestionSummary {
  why: string | null;
  keyPoints: string[];
  answerGuide: string | null;
  sampleAnswer: string | null;
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

const API = `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api`;

/** Dựng query string từ bộ lọc, bỏ các giá trị rỗng. */
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

/** Gọi API ngân hàng câu hỏi từ server component, cache 5 phút. */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Question bank API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const questionBankService = {
  facets: (filters: QuestionFilters = {}) =>
    get<QuestionFacets>(`/question-bank/filters${query(filters)}`),

  /** Lấy số đếm bộ lọc phía trình duyệt, gọi lại mỗi lần đổi bộ lọc. */
  browseFacets: (filters: QuestionFilters = {}) =>
    api
      .get<QuestionFacets>(`/question-bank/filters${query(filters)}`)
      .then((r) => r.data),

  list: (filters: QuestionFilters = {}) =>
    get<QuestionPage>(`/question-bank${query(filters)}`),

  /** Lấy danh sách câu hỏi phía trình duyệt khi người dùng đổi bộ lọc. */
  browse: (filters: QuestionFilters = {}) =>
    api
      .get<QuestionPage>(`/question-bank${query(filters)}`)
      .then((r) => r.data),

  /** Lấy câu hỏi kèm đáp án, sinh bằng model nếu chưa có. */
  answer: (id: string) =>
    api
      .post<QuestionDetail>(`/question-bank/${encodeURIComponent(id)}/answer`)
      .then((r) => r.data),
};
