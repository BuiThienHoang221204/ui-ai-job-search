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
