import type {
  CvContentInput,
  CvIdentityEdit,
  CvTypography,
  CvLanguage,
  CvLayout,
  CvSectionKey,
  CvSourceInput,
} from "@/services";

export interface CvTodo {
  id: string;
  kind: "keyword" | "field" | "metric";
  section: CvSectionKey;
  label: string;
  hint: string;
  done: boolean;
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
