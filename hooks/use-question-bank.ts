"use client";

import { useEffect, useState, useTransition } from "react";
import {
  questionBankService,
  type QuestionFacets,
  type QuestionPage,
} from "@/services/question-bank";

export const QUESTION_PAGE_SIZE = 20;

const SEARCH_DEBOUNCE_MS = 250;

export type QuestionFilterOption = { code: string; name: string; count: number };

/** Đảm bảo mục đang chọn luôn có trong danh sách, kể cả khi số đếm về 0. */
function withSelected(
  options: QuestionFilterOption[],
  value: string | null,
  fallback: QuestionFilterOption[],
): QuestionFilterOption[] {
  if (!value || options.some((o) => o.code === value)) return options;
  const known = fallback.find((o) => o.code === value);
  return [...options, { code: value, name: known?.name ?? value, count: 0 }];
}

/** Đổi danh sách độ khó (chỉ có tên) sang cùng dạng lựa chọn với các bộ lọc khác. */
const difficultyOptionsOf = (facets: QuestionFacets): QuestionFilterOption[] =>
  facets.difficulties.map((d) => ({ code: d.name, name: d.name, count: d.count }));

/** Bộ lọc gửi lên API; `null` nghĩa là chưa lọc gì, tức đúng bộ lọc server đã dùng để tải sẵn trang đầu. */
export function questionFilters(
  term: string,
  industry: string | null,
  type: string | null,
  difficulty: string | null,
) {
  const filters = {
    industry: industry ?? undefined,
    type: type ?? undefined,
    difficulty: difficulty ?? undefined,
    q: term.trim() || undefined,
  };
  return Object.values(filters).some(Boolean) ? filters : null;
}

/** Trạng thái bộ lọc, phân trang và dữ liệu của ngân hàng câu hỏi; đổi bộ lọc nào cũng quay về trang đầu. */
export function useQuestionBank(initialFacets: QuestionFacets, initial: QuestionPage) {
  const [term, setTerm] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [fetchedPage, setPage] = useState<QuestionPage | null>(null);
  const [fetchedFacets, setFacets] = useState<QuestionFacets | null>(null);
  const [pending, startTransition] = useTransition();

  const filters = questionFilters(term, industry, type, difficulty);
  const page = !filters && offset === 0 ? initial : (fetchedPage ?? initial);
  const facets = filters ? (fetchedFacets ?? initialFacets) : initialFacets;

  useEffect(() => {
    const filters = questionFilters(term, industry, type, difficulty);
    if (!filters && offset === 0) return;
    const timer = setTimeout(() => {
      startTransition(async () => {
        setPage(
          await questionBankService.browse({
            ...filters,
            limit: QUESTION_PAGE_SIZE,
            offset,
          }),
        );
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term, industry, type, difficulty, offset]);

  useEffect(() => {
    const filters = questionFilters(term, industry, type, difficulty);
    if (!filters) return;
    const timer = setTimeout(() => {
      startTransition(async () => {
        setFacets(await questionBankService.browseFacets(filters));
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term, industry, type, difficulty]);

  /** Bọc một setter để mỗi lần đổi bộ lọc thì quay về trang đầu. */
  function resetting<T>(setter: (next: T) => void) {
    return (next: T) => {
      setter(next);
      setOffset(0);
    };
  }

  /** Bỏ mọi bộ lọc chọn (giữ nguyên ô tìm kiếm) và quay về trang đầu. */
  function clearFilters() {
    setIndustry(null);
    setType(null);
    setDifficulty(null);
    setOffset(0);
  }

  return {
    term,
    industry,
    type,
    difficulty,
    offset,
    page,
    pending,
    setTerm: resetting(setTerm),
    setIndustry: resetting(setIndustry),
    setType: resetting(setType),
    setDifficulty: resetting(setDifficulty),
    setOffset,
    clearFilters,
    activeCount: [industry, type, difficulty].filter(Boolean).length,
    industryOptions: withSelected(facets.industries, industry, initialFacets.industries),
    typeOptions: withSelected(facets.types, type, initialFacets.types),
    difficultyOptions: withSelected(
      difficultyOptionsOf(facets),
      difficulty,
      difficultyOptionsOf(initialFacets),
    ),
  };
}
