export type LearningStatus = "LEARNING" | "SKIPPED" | "DONE";

export type WeekDay = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface SkillGapItem {
  key: string;
  name: string;
  kind: "REQUIRED" | "NICE";
  demand: number;
  near: number;
  jobs: { id: string; title: string; company: string }[];
  status: LearningStatus | "OPEN";
}

export interface LearningItem {
  id: string;
  skillKey: string;
  skillName: string;
  status: LearningStatus;
  steps: boolean[];
  days: WeekDay[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningOverview {
  needsOccupation: boolean;
  occupationCode: string | null;
  occupationName: string | null;
  subOccupationNames: string[];
  experienceLevel: string | null;
  jobsAnalysed: number;
  profileUpdatedAt: string | null;
  gaps: SkillGapItem[];
  plan: LearningItem[];
  skipped: LearningItem[];
}

export interface SaveLearningInput {
  skillName: string;
  status: "LEARNING" | "SKIPPED";
  steps?: boolean[];
  days?: WeekDay[];
}
