"use client";

import { CaretDown, Check } from "@phosphor-icons/react/ssr";
import type { JobSort } from "@/types";
import { cn } from "@/lib/cn";
import { useDropdown } from "@/hooks/use-dropdown";

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
  { value: "match", label: "Điểm AI Match" },
];

/** Sắp xếp danh sách việc làm, dạng chữ liền dòng cạnh số kết quả. */
export function JobSortMenu({
  value,
  onChange,
}: {
  value: JobSort;
  onChange: (next: JobSort) => void;
}) {
  const { open, setOpen, root } = useDropdown();
  const current = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((now) => !now)}
        aria-expanded={open}
        aria-label="Sắp xếp"
        className="flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 font-semibold text-slate-900 hover:bg-slate-100"
      >
        {current?.label}
        <CaretDown
          className={cn(
            "size-3.5 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute top-9 right-0 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              {option.label}
              {option.value === value && (
                <Check className="text-primary-600 size-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
