import type { ApplicationEmailInput } from "./document";

export type LetterKind = "COVER_LETTER" | "APPLICATION_EMAIL";

export interface LetterCheck {
  id: string;
  ok: boolean;
  title: string;
  detail: string;
}

export interface PartialLetter {
  salutation?: string | null;
  opening?: string | null;
  bodyParagraphs?: string[];
  motivation?: string | null;
  closing?: string | null;
}

export type LetterGenerate = (
  kind: LetterKind,
  input: ApplicationEmailInput,
) => void;
