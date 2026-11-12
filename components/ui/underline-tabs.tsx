import { cn } from "@/lib/cn";

/** Tab dạng chữ có gạch chân dưới mục đang chọn, dùng ở tiêu đề các khối trang Tổng quan. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex max-w-full gap-4 overflow-x-auto [scrollbar-width:none]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "cursor-pointer border-b-2 pb-1 text-sm whitespace-nowrap transition-colors",
            tab.value === value
              ? "border-primary-600 font-semibold text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
