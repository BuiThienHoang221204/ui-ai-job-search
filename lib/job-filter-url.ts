import type {
  FilterOption,
  JobFilterValue,
  JobSort,
  OccupationOption,
} from "@/types";
import { fold } from "@/lib/text";

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
    followed: params.get("followed") === "1",
    subOccupation: params.getAll("subOccupation"),
    since: params.get("since") ?? "",
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
  if (filter.followed) params.set("followed", "1");
  if (filter.sort !== DEFAULT_SORT) params.set("sort", filter.sort);
  if (filter.since) params.set("since", filter.since);
  if (offset) params.set("offset", String(offset));
  return params.toString();
}

/** Tên hiển thị của một mã tỉnh hoặc nhóm ngành; không thấy thì trả lại chính mã. */
export function optionName(options: FilterOption[], code: string): string {
  return options.find((option) => option.code === code)?.name ?? code;
}

/** Tên hiển thị của một mã nghề con trong các nhóm ngành; không thấy thì trả lại chính mã. */
export function subOptionName(groups: OccupationOption[], code: string): string {
  for (const group of groups) {
    const sub = group.subs?.find((item) => item.code === code);
    if (sub) return sub.name;
  }
  return code;
}

/** Rút gọn danh sách tên đã chọn thành một nhãn: tên đầu và số còn lại ("Kế toán +2"). */
export function summarizeNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names[0]} +${names.length - 1}`;
}

/** Tỉnh để chọn: có tin hoặc đang được chọn, nhiều tin xếp trước. */
export function provinceChoices(
  provinces: FilterOption[],
  selected: string[],
): FilterOption[] {
  return provinces
    .filter((option) => option.count > 0 || selected.includes(option.code))
    .sort((a, b) => b.count - a.count);
}

export interface OccupationMatch {
  code: string;
  name: string;
  count: number;
  sub: boolean;
}

/** Nhóm ngành và nghề con có tên chứa từ khoá (so không dấu), nhiều tin trước, tối đa `limit`. */
export function matchOccupations(
  groups: OccupationOption[],
  query: string,
  limit: number,
): OccupationMatch[] {
  const needle = fold(query.trim());
  if (!needle) return [];
  const matched: OccupationMatch[] = [];
  for (const group of groups) {
    if (fold(group.name).includes(needle)) {
      matched.push({ code: group.code, name: group.name, count: group.count, sub: false });
    }
    for (const sub of group.subs ?? []) {
      if (fold(sub.name).includes(needle)) {
        matched.push({ code: sub.code, name: sub.name, count: sub.count, sub: true });
      }
    }
  }
  return matched.sort((a, b) => b.count - a.count).slice(0, limit);
}
