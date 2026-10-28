import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Một thẻ bước trên trang chào: số thứ tự nằm trên đường nối bên trái, nội dung tuỳ bước. */
export function GuestStep({
  n,
  className,
  children,
}: {
  n: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "animate-float relative flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10",
        className,
      )}
    >
      <span className="bg-primary-600 ring-primary-50 absolute top-1/2 -left-9 grid size-7 -translate-y-1/2 place-items-center rounded-full text-xs font-bold text-white ring-4">
        {n}
      </span>
      {children}
    </div>
  );
}
