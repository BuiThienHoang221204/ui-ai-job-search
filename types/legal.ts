import type { ReactNode } from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

export type LegalTone = "primary" | "emerald" | "amber" | "rose" | "sky";

export interface LegalSection {
  id: string;
  title: string;
  icon: PhosphorIcon;
  tone: LegalTone;
  short: string;
  body: ReactNode;
}
