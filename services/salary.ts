export interface SalaryOccupation {
  code: string;
  name: string;
  positionCount: number;
}

export interface SalaryPositionSummary {
  positionSlug: string;
  positionName: string;
  occupationCode: string | null;
  occupationName: string | null;
  avgMonthly: number | null;
  rangeMin: number | null;
  rangeMax: number | null;
  currency: string;
}

export interface SalaryBand {
  experienceLabel: string;
  minAmount: number | null;
  avgAmount: number | null;
  maxAmount: number | null;
}

export interface SalaryPeer {
  positionSlug: string;
  positionName: string;
  avgMonthly: number | null;
  rank: number;
  isCurrent: boolean;
}

export interface SalaryPositionDetail extends SalaryPositionSummary {
  provider: string;
  providerUrl: string;
  updatedAt: string;
  sampleSize: number | null;
  bands: SalaryBand[];
  peers: SalaryPeer[];
}

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
