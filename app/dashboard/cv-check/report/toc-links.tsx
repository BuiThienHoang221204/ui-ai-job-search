"use client";

import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/cn";

/** Mục lục dính bên trái: bấm thì cuộn mượt tới mục, cuộn trang thì tự đánh dấu mục đang đọc. */
export function TocLinks({
  items,
}: {
  items: Array<{ id: string; label: string }>;
}) {
  const { active, go } = useActiveSection(items.map((item) => item.id));

  return items.map((item) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      onClick={(event) => {
        event.preventDefault();
        go(item.id);
      }}
      className={cn(
        "block border-l-2 border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900",
        active === item.id && "border-primary-600 font-semibold text-slate-900",
      )}
    >
      {item.label}
    </a>
  ));
}
