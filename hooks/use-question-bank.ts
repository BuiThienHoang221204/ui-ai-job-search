"use client";

import { useState } from "react";
import { questionBankService } from "@/services/question-bank";
import { useApiQuery } from "@/hooks/use-api-query";
import { useDebounce } from "@/hooks/use-debounce";
import { keys } from "@/lib/query-keys";
import { questionFilters } from "@/lib/question-filters";
import type { QuestionFacets, QuestionPage } from "@/types";
import type { QuestionFilterOption } from "@/types";

export const QUESTION_PAGE_SIZE = 20;

const SEARCH_DEBOUNCE_MS = 250;

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

/** Trạng thái bộ lọc, phân trang và dữ liệu của ngân hàng câu hỏi; đổi bộ lọc nào cũng quay về trang đầu. */
export function useQuestionBank(initialFacets: QuestionFacets, initial: QuestionPage) {
  const [term, setTerm] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const searched = useDebounce(term, SEARCH_DEBOUNCE_MS);

  const filters = questionFilters(searched, industry, type, difficulty);
  const pageQuery = useApiQuery(
    keys.questionPage(filters, offset),
    () =>
      questionBankService.browse({
        ...filters,
        limit: QUESTION_PAGE_SIZE,
        offset,
      }),
    {
      errorMessage: "Không tải được danh sách câu hỏi",
      enabled: Boolean(filters) || offset > 0,
      keepPrevious: true,
    },
  );
  const facetsQuery = useApiQuery(
    keys.questionFacets(filters),
    () => questionBankService.browseFacets(filters ?? {}),
    {
      errorMessage: "Không tải được bộ lọc câu hỏi",
      enabled: Boolean(filters),
      keepPrevious: true,
    },
  );

  const page: QuestionPage =
    !filters && offset === 0 ? initial : (pageQuery.data ?? initial);
  const facets: QuestionFacets = filters
    ? (facetsQuery.data ?? initialFacets)
    : initialFacets;
  const pending = pageQuery.loading || facetsQuery.loading;

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
