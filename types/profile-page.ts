import type { ProfileRecord } from "@/services";

export type ProfileUpdate = Partial<
  Omit<
    ProfileRecord,
    "id" | "userId" | "completion" | "createdAt" | "updatedAt"
  >
>;

export type Item = Record<string, unknown>;

export type RecordType =
  "experiences" | "projects" | "educations" | "certificates";

export interface RecordField {
  name: string;
  label: string;
  placeholder: string;
  kind?: "lines" | "tags" | "area";
}

export interface RecordView {
  title: string;
  sub: string;
  when: string;
  lines: string[];
  tags: string[];
}

export type ProfileTab = "cv" | "wish";

export interface Improvement {
  key: string;
  done: boolean;
  title: string;
  detail: string;
  tab: ProfileTab;
  anchor: string;
}

export type ProfileEditing =
  | { kind: "basic" }
  | { kind: "record"; type: RecordType; index: number | null };
