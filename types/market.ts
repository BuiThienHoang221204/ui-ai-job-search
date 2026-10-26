export interface MarketOccupation {
  slug: string;
  name: string;
  total: number;
}

export interface MarketShare {
  name: string;
  percent: number;
}

export interface MarketReport {
  slug: string;
  name: string;
  from: string;
  to: string;
  total: number;
  companies: number;
  salary: { median: number | null; withSalaryPercent: number };
  skills: { analysed: number; top: MarketShare[] };
  subOccupations: {
    name: string;
    salarySlug: string | null;
    count: number;
    medianSalary: number | null;
  }[];
  provinces: MarketShare[];
  seniority: { label: string; percent: number }[];
}
