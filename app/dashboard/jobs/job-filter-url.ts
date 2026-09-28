import type { JobSort } from "@/services";
import type { JobFilterValue } from "@/components/dashboard/job-filter-bar";

export const SORTS: JobSort[] = ["newest", "salary", "match"];

export const DEFAULT_SORT: JobSort = "newest";

/** Đọc bộ lọc việc làm từ URL; phải khứ hồi chính xác với `writeFilter`. */
export function readFilter(
  params: URLSearchParams,
): JobFilterValue {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    province: params.getAll("province"),
    occupation: params.getAll("occupation"),
    salaryMin: Number(params.get("salaryMin") ?? 0) || 0,
    postedWithin: Number(params.get("postedWithin") ?? 0) || 0,
    sort: SORTS.includes(sort as JobSort)
      ? (sort as JobSort)
      : DEFAULT_SORT,
    saved: params.get("saved") === "1",
    applied: params.get("applied") === "1",
    subOccupation: params.getAll("subOccupation"),
  };
}

/** Ghi bộ lọc lên URL, bỏ giá trị rỗng/mặc định để khoá cache ổn định. */
export function writeFilter(
  filter: JobFilterValue,
  offset: number,
  scored: boolean,
  selected?: string | null,
): string {
  const params = new URLSearchParams();
  if (scored) params.set("scored", "1");
  if (selected) params.set("job", selected);
  if (filter.q) params.set("q", filter.q);
  for (const code of filter.province) params.append("province", code);
  for (const code of filter.occupation) params.append("occupation", code);
  for (const code of filter.subOccupation) params.append("subOccupation", code);
  if (filter.salaryMin) params.set("salaryMin", String(filter.salaryMin));
  if (filter.postedWithin)
    params.set("postedWithin", String(filter.postedWithin));
  if (filter.saved) params.set("saved", "1");
  if (filter.applied) params.set("applied", "1");
  if (filter.sort !== DEFAULT_SORT) params.set("sort", filter.sort);
  if (offset) params.set("offset", String(offset));
  return params.toString();
}
