"use client";

import { useState } from "react";
import {
  Briefcase,
  Buildings,
  ClockCounterClockwise,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { fold } from "@/lib/text";
import { matchOccupations } from "@/lib/job-filter-url";
import { addRecent, readRecent, writeRecent } from "@/lib/recent-searches";
import { useDropdown } from "@/hooks/use-dropdown";
import { useJobFilters } from "@/hooks/use-job-filters";
import { useJobSuggestions } from "@/hooks/use-job-suggestions";
import { MatchHighlight } from "./match-highlight";

const MAX_OCCUPATIONS = 3;

type Suggestion =
  | { kind: "recent" | "title" | "company"; text: string; count?: number }
  | { kind: "occupation"; text: string; count: number; code: string; sub: boolean };

const SECTIONS: { kind: Suggestion["kind"]; title: string; icon: PhosphorIcon }[] = [
  { kind: "recent", title: "Tìm gần đây", icon: ClockCounterClockwise },
  { kind: "title", title: "Chức danh", icon: MagnifyingGlass },
  { kind: "occupation", title: "Ngành nghề", icon: Briefcase },
  { kind: "company", title: "Công ty", icon: Buildings },
];

/** Ô "cái gì" của thanh tìm việc: gõ chỉ hiện gợi ý (tìm gần đây, chức danh, ngành nghề, công ty kèm số tin); chọn gợi ý hoặc xoá ô mới tìm. */
export function JobSearchBox({
  query,
  onQuery,
  onSearch,
  onPickOccupation,
}: {
  query: string;
  onQuery: (next: string) => void;
  onSearch: (next: string) => void;
  onPickOccupation: (code: string, sub: boolean) => void;
}) {
  const { open, setOpen, root } = useDropdown();
  const [cursor, setCursor] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const suggestions = useJobSuggestions(query);
  const occupations = useJobFilters().data?.occupations ?? [];

  const term = query.trim();
  const needle = fold(term);
  const searching = term.length >= 2;

  const items: Suggestion[] = [];
  for (const text of recent) {
    if (needle && !fold(text).includes(needle)) continue;
    items.push({ kind: "recent", text });
  }
  if (searching) {
    for (const row of suggestions.data?.titles ?? []) {
      items.push({ kind: "title", ...row });
    }
    for (const match of matchOccupations(occupations, term, MAX_OCCUPATIONS)) {
      items.push({ kind: "occupation", text: match.name, count: match.count, code: match.code, sub: match.sub });
    }
    for (const row of suggestions.data?.companies ?? []) {
      items.push({ kind: "company", ...row });
    }
  }

  const show = open && items.length > 0;

  const openList = () => {
    setRecent(readRecent());
    setOpen(true);
  };

  const pick = (item: Suggestion) => {
    setOpen(false);
    setCursor(-1);
    if (item.kind === "occupation") {
      onPickOccupation(item.code, item.sub);
      return;
    }
    writeRecent(addRecent(readRecent(), item.text));
    onQuery(item.text);
    onSearch(item.text);
  };

  const forget = (text: string) => {
    const next = recent.filter((item) => item !== text);
    setRecent(next);
    writeRecent(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) openList();
      setCursor((now) => Math.min(now + 1, items.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((now) => Math.max(now - 1, -1));
    }
    if (event.key === "Enter" && show && cursor >= 0) {
      event.preventDefault();
      pick(items[cursor]);
    }
    if (event.key === "Escape") setOpen(false);
  };

  return (
    <div
      ref={root}
      className="relative col-start-1 row-start-1 flex min-w-0 flex-1 items-center gap-2.5 px-4"
    >
      <MagnifyingGlass className="size-4.5 shrink-0 text-slate-400" />
      <input
        type="text"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={show}
        aria-controls="job-search-suggestions"
        aria-label="Tìm việc làm"
        value={query}
        onFocus={openList}
        onKeyDown={onKeyDown}
        onChange={(event) => {
          setCursor(-1);
          if (!open) openList();
          onQuery(event.target.value);
        }}
        placeholder="Chức danh, kỹ năng hoặc công ty"
        className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            onQuery("");
            onSearch("");
          }}
          aria-label="Xoá tìm kiếm"
          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded text-slate-400 hover:text-slate-700"
        >
          <X className="size-4" />
        </button>
      )}

      {show && (
        <div
          id="job-search-suggestions"
          role="listbox"
          className="absolute top-full left-0 z-40 mt-2 w-full max-w-160 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {SECTIONS.map((section) => {
            const rows = items.filter((item) => item.kind === section.kind);
            if (rows.length === 0) return null;
            const Icon = section.icon;
            return (
              <div key={section.kind}>
                <p className="px-2.5 pt-2 pb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </p>
                {rows.map((item) => {
                  const at = items.indexOf(item);
                  return (
                    <div
                      key={`${item.kind}-${item.text}`}
                      role="option"
                      aria-selected={at === cursor}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pick(item)}
                      onMouseEnter={() => setCursor(at)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700",
                        at === cursor && "bg-slate-100",
                      )}
                    >
                      <Icon className="size-4.5 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate">
                        <MatchHighlight text={item.text} needle={term} />
                      </span>
                      {item.count !== undefined && (
                        <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                          {item.count.toLocaleString("vi-VN")} tin
                        </span>
                      )}
                      {item.kind === "recent" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            forget(item.text);
                          }}
                          aria-label={`Xoá "${item.text}" khỏi tìm gần đây`}
                          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
