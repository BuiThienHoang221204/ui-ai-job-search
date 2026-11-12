"use client";

import type { RefObject } from "react";
import { useScrollMemory } from "@/hooks/use-scroll-memory";

/** Gắn bộ nhớ vị trí cuộn cho khung `<main>`; tách riêng để bọc được trong `Suspense` vì hook đọc `useSearchParams`. */
export function ScrollMemory({ target }: { target: RefObject<HTMLElement | null> }) {
  useScrollMemory(target);
  return null;
}
