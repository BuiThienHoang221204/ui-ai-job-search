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

export type QuestionFilterOption = {
  code: string;
  name: string;
  count: number;
};
