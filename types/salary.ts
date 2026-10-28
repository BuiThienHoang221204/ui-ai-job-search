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
  bands: SalaryBand[];
  peers: SalaryPeer[];
}
