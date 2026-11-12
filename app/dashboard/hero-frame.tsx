import type { ReactNode } from "react";
import { CvHeroArt } from "./hero-art/cv-hero-art";

export const PRIMARY_CTA =
  "inline-flex h-11 items-center gap-2 rounded-xl bg-primary-600 px-4.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700";
export const SECONDARY_CTA =
  "inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4.5 text-sm font-semibold text-slate-900 transition-colors hover:border-primary-200";

/** Khung hero của trang Tổng quan: nền gradient có quầng sáng, nội dung bên trái và minh hoạ CV đếm tới `score` bên phải. */
export function HeroFrame({ score, children }: { score: number; children: ReactNode }) {
  return (
    <section className="relative isolate grid overflow-hidden rounded-[1.25rem] border border-primary-100 bg-[linear-gradient(115deg,#fff_0%,var(--color-primary-50)_38%,var(--color-primary-100)_70%,var(--color-primary-200)_100%)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-56 -right-32 -z-10 size-140 rounded-full bg-[radial-gradient(circle,var(--color-primary-400)_0%,var(--color-primary-300)_30%,transparent_68%)] opacity-75 blur-[48px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-64 left-[38%] -z-10 h-105 w-130 rounded-full bg-[radial-gradient(circle,var(--color-primary-300)_0%,transparent_70%)] opacity-60 blur-[48px]"
      />

      <div className="flex flex-col justify-center gap-4 p-4 sm:p-8">{children}</div>

      <div className="hidden items-center justify-center px-4 lg:flex">
        <div className="w-full max-w-[40rem]">
          <CvHeroArt score={score} />
        </div>
      </div>
    </section>
  );
}
