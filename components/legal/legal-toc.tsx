"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/cn";

/** Mục lục của trang pháp lý: icon từng mục, thanh tiến độ đọc và link sang trang còn lại. */
export function LegalToc({
  items,
  other,
}: {
  items: Array<{ id: string; label: string; icon: ReactNode }>;
  other: { href: string; label: string };
}) {
  const { active, go } = useActiveSection(items.map((item) => item.id));
  const index = items.findIndex((item) => item.id === active);

  return (
    <nav className="sticky top-4 hidden lg:block">
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-slate-200">
        <span
          className="bg-primary-600 block h-full rounded-full transition-[width] duration-300"
          style={{ width: `${((index + 1) / items.length) * 100}%` }}
        />
      </div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(event) => {
            event.preventDefault();
            go(item.id);
          }}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 [&_svg]:size-4.5 [&_svg]:shrink-0",
            active === item.id &&
              "bg-primary-50 text-primary-600 hover:bg-primary-50 hover:text-primary-600 font-semibold",
          )}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
      <Link
        href={other.href}
        className="mt-3 flex items-center justify-between border-t border-slate-200 px-2.5 pt-3 text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        {other.label}
        <CaretRight className="size-4" />
      </Link>
    </nav>
  );
}
