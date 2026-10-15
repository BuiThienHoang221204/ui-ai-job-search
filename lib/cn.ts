import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Ghép class Tailwind có điều kiện, lớp sau thắng lớp trước khi xung đột. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
