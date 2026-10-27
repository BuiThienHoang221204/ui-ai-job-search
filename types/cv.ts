import type {
  CvContentInput,
  CvIdentityEdit,
  CvLanguage,
  CvLayout,
  CvSectionKey,
  CvSourceInput,
  CvTypography,
} from "./document";

export type CvBullet =
  | { kind: "experience" | "project"; entry: number; line: number }
  | { kind: "description"; entry: number }
  | { kind: "competency"; line: number }
  | { kind: "profile" | "headline" };

export interface CvTodo {
  id: string;
  kind: "keyword" | "field" | "metric";
  section: CvSectionKey;
  label: string;
  hint: string;
  done: boolean;
  bullet?: CvBullet;
}

export interface BulletSuggestion {
  text: string;
  keywords: string[];
}

export interface BulletRewrite {
  suggestions: BulletSuggestion[];
  remaining: number;
}

export type CvRailTab = "hoan-thien" | "thiet-ke" | "bo-cuc";

export interface CvDraft {
  content: CvContentInput;
  identity: CvIdentityEdit;
  layout: CvLayout;
  templateId: string;
  accent: string | undefined;
  typography: CvTypography;
}

export type CvGenerate = (input: CvSourceInput, language: CvLanguage) => void;
