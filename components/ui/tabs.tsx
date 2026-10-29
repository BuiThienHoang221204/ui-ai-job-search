import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Trên mobile các tab chia đều hết chiều ngang; từ sm trở lên co theo nội dung như thường. */
  mobileFull?: boolean;
}

/** Thanh tab chuyển khung nhìn. */
export function Tabs({
  tabs,
  value,
  onChange,
  className,
  mobileFull,
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 rounded-xl bg-slate-100 p-1",
        mobileFull
          ? "w-full sm:w-fit sm:max-w-full"
          : "scrollbar-thin w-fit max-w-full overflow-x-auto",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              mobileFull
                ? "flex-1 text-center sm:flex-none sm:text-left"
                : "shrink-0",
              active
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
