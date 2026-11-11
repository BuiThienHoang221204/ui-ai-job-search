"use client";

import { useState } from "react";
import {
  CaretDown,
  Check,
  HouseLine,
  MagnifyingGlass,
  MapPin,
} from "@phosphor-icons/react/ssr";
import type { FilterOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { fold } from "@/lib/text";
import { summarizeNames } from "@/lib/job-filter-url";
import { useDropdown } from "@/hooks/use-dropdown";

/** Phần "ở đâu" của ô tìm việc: chọn nhiều tỉnh/thành có số tin, công tắc chỉ việc làm từ xa ở đầu bảng. */
export function LocationMenu({
  options,
  selected,
  remoteCode,
  onToggle,
  onClear,
}: {
  options: FilterOption[];
  selected: string[];
  remoteCode: string;
  onToggle: (code: string) => void;
  onClear: () => void;
}) {
  const { open, setOpen, root } = useDropdown();
  const [needle, setNeedle] = useState("");

  const visible = needle.trim()
    ? options.filter((option) => fold(option.name).includes(fold(needle.trim())))
    : options;
  const remoteOn = Boolean(remoteCode) && selected.includes(remoteCode);
  const names = options
    .filter((option) => selected.includes(option.code))
    .map((option) => option.name);
  if (remoteOn) names.unshift("Từ xa");

  return (
    <div
      ref={root}
      className="relative col-start-1 row-start-2 flex min-w-0 border-t border-slate-200 sm:w-64 sm:flex-none sm:border-t-0"
    >
      <button
        type="button"
        onClick={() => setOpen((now) => !now)}
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center gap-2 px-4 text-left text-sm",
          open && "bg-slate-50",
        )}
      >
        <MapPin
          className={cn(
            "size-4.5 shrink-0",
            names.length > 0 ? "text-primary-600" : "text-slate-400",
          )}
        />
        <span className="flex-1 truncate text-slate-900">
          {summarizeNames(names) || "Toàn quốc"}
        </span>
        <CaretDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl sm:right-0 sm:left-auto border border-slate-200 bg-white p-2 shadow-xl">
          <label className="focus-within:border-primary-400 flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm">
            <MagnifyingGlass className="size-4 text-slate-400" />
            <input
              value={needle}
              onChange={(event) => setNeedle(event.target.value)}
              placeholder="Tìm tỉnh, thành phố"
              className="min-w-0 flex-1 outline-none placeholder:text-slate-400"
            />
          </label>
          {remoteCode && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800">
              <HouseLine className="text-primary-600 size-4.5" />
              Chỉ việc làm từ xa
              <span className="ml-auto">
                <Switch
                  checked={remoteOn}
                  onChange={() => onToggle(remoteCode)}
                  label="Chỉ việc làm từ xa"
                />
              </span>
            </div>
          )}
          <ul className="scrollbar-thin mt-1 max-h-64 overflow-y-auto">
            {visible.map((option) => {
              const checked = selected.includes(option.code);
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    onClick={() => onToggle(option.code)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "grid size-4.5 shrink-0 place-items-center rounded-md border",
                        checked
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-slate-300",
                      )}
                    >
                      {checked && <Check className="size-3.5" weight="bold" />}
                    </span>
                    <span className="flex-1 truncate text-slate-700">
                      {option.name}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {option.count.toLocaleString("vi-VN")}
                    </span>
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-2 py-6 text-center text-xs text-slate-400">
                Không có nơi nào khớp
              </li>
            )}
          </ul>
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 px-1 pt-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Bỏ chọn
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Xong
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
