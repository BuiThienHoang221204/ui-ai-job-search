"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { CheckList } from "@/components/ui/check-list";
import { useDropdown } from "@/hooks/use-dropdown";
import { cn } from "@/lib/cn";

interface MultiPickFieldProps {
  title: string;
  emptyLabel: string;
  options: { code: string; name: string }[];
  selected: string[];
  onSave: (codes: string[]) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
}

/** Ô chọn nhiều dạng field: tick trong danh sách rồi bấm Lưu mới gửi đi một lần. */
export function MultiPickField({
  title,
  emptyLabel,
  options,
  selected,
  onSave,
  searchPlaceholder,
  disabled,
}: MultiPickFieldProps) {
  const { open, setOpen, root } = useDropdown();
  const [draft, setDraft] = useState<string[]>([]);
  const names = options
    .filter((option) => selected.includes(option.code))
    .map((option) => option.name);

  let summary = emptyLabel;
  if (names.length) {
    summary = names.slice(0, 2).join(", ");
    if (names.length > 2) summary += ` +${names.length - 2}`;
  }

  return (
    <div ref={root} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => {
          setDraft(selected);
          setOpen(!open);
        }}
        className="focus:border-primary-500 focus:ring-primary-100 flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 shadow-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={cn("flex-1 truncate", !names.length && "text-slate-400")}>
          {summary}
        </span>
        <CaretDown
          className={cn(
            "size-4.5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-11 left-0 z-20 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <div className="scrollbar-thin max-h-72 overflow-y-auto">
            <CheckList
              title={title}
              options={options}
              selected={draft}
              onChange={setDraft}
              searchPlaceholder={searchPlaceholder}
            />
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 px-1.5 pt-2">
            <span className="text-xs text-slate-500">
              Đã chọn {draft.length}/{options.length}
            </span>
            <span className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onSave(draft);
                  setOpen(false);
                }}
              >
                Lưu
              </Button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
