import type {
  CvContentInput,
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

export type CvRailTab = "hoan-thien" | "noi-dung" | "bo-cuc";

export interface CvDraft {
  content: CvContentInput;
  layout: CvLayout;
  templateId: string;
  accent: string | undefined;
}

export type CvGenerate = (input: CvSourceInput, language: CvLanguage) => void;
