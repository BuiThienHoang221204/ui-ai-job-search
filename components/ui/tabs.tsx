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
  /** Các tab chia đều hết chiều ngang (segmented control) thay vì co theo nội dung. */
  fullWidth?: boolean;
}

/** Thanh tab chuyển khung nhìn. */
export function Tabs({
  tabs,
  value,
  onChange,
  className,
  fullWidth,
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 rounded-xl bg-slate-100 p-1",
        fullWidth
          ? "w-full"
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
              fullWidth ? "flex-1 text-center" : "shrink-0",
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
