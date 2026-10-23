"use client";

import { useState } from "react";
import { Check, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

interface CheckListOption {
  code: string;
  name: string;
}

interface CheckListProps {
  title: string;
  options: CheckListOption[];
  selected: string[];
  onChange: (codes: string[]) => void;
  searchPlaceholder?: string;
}

/** Danh sách tick nhiều mục, có nút chọn/bỏ tất cả và ô tìm khi truyền `searchPlaceholder`. */
export function CheckList({
  title,
  options,
  selected,
  onChange,
  searchPlaceholder,
}: CheckListProps) {
  const [needle, setNeedle] = useState("");
  const allPicked =
    options.length > 0 && options.every((option) => selected.includes(option.code));
  const normalized = needle.trim().toLowerCase();
  const visible = normalized
    ? options.filter((option) => option.name.toLowerCase().includes(normalized))
    : options;

  const toggle = (code: string) =>
    onChange(
      selected.includes(code)
        ? selected.filter((item) => item !== code)
        : [...selected, code],
    );

  return (
    <div>
      <div className="flex items-center justify-between px-3 pt-1 pb-2 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
        {title}
        <button
          type="button"
          onClick={() => onChange(allPicked ? [] : options.map((option) => option.code))}
          className="text-primary-600 hover:text-primary-700 cursor-pointer normal-case"
        >
          {allPicked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>

      {searchPlaceholder && (
        <div className="relative mx-1.5 mb-1.5">
          <MagnifyingGlass className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
            placeholder={searchPlaceholder}
            className="focus:border-primary-500 w-full rounded-lg border border-slate-200 py-1.5 pr-2.5 pl-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      )}

      {visible.map((option) => {
        const on = selected.includes(option.code);
        return (
          <button
            key={option.code}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => toggle(option.code)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm",
              on
                ? "bg-primary-50 text-primary-800 font-semibold"
                : "text-slate-700 hover:bg-slate-50",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded border",
                on ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300",
              )}
            >
              {on && <Check className="size-3" />}
            </span>
            <span className="min-w-0 truncate">{option.name}</span>
          </button>
        );
      })}
      {visible.length === 0 && (
        <p className="px-3 py-4 text-center text-xs text-slate-400">
          Không có mục nào khớp
        </p>
      )}
    </div>
  );
}
