import type {
  SalaryOccupation,
  SalaryPositionDetail,
  SalaryPositionSummary,
} from "@/types";

const API = `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api`;

/** Gọi API lương công khai từ server component, cache 1 giờ. */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Salary API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const salaryService = {
  occupations: () => get<SalaryOccupation[]>("/salary/occupations"),
  positions: () => get<SalaryPositionSummary[]>("/salary/positions"),
  position: (slug: string) =>
    get<SalaryPositionDetail>(`/salary/positions/${encodeURIComponent(slug)}`),
};
