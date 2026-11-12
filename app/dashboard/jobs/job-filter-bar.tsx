"use client";

import { useState } from "react";
import {
  Bookmark,
  Buildings,
  CaretDown,
  ListBullets,
  MagnifyingGlass,
  PaperPlaneRight,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { JobFilterValue } from "@/types";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { cn } from "@/lib/cn";
import {
  optionName,
  provinceChoices,
  subOptionName,
  summarizeNames,
} from "@/lib/job-filter-url";
import { addRecent, readRecent, writeRecent } from "@/lib/recent-searches";
import { useSession } from "@/hooks/use-session";
import { useJobFilters } from "@/hooks/use-job-filters";
import {
  EMPTY_FILTER,
  EXPERIENCE_STEPS,
  POSTED_STEPS,
  SENIORITY_OPTIONS,
} from "./job-filter-options";
import { JobFilterSheet } from "./job-filter-sheet";
import { JobSearchBox } from "./job-search-box";
import { JobSortMenu } from "./job-sort-menu";
import { LocationMenu } from "./location-menu";
import { OccupationPicker } from "./occupation-picker";

const VIEW_TABS: {
  value: string;
  label: string;
  short?: string;
  icon?: PhosphorIcon;
}[] = [
  { value: "all", label: "Tất cả" },
  { value: "saved", label: "Đã lưu", icon: Bookmark },
  { value: "applied", label: "Đã ứng tuyển", icon: PaperPlaneRight },
  { value: "followed", label: "Công ty theo dõi", short: "Theo dõi", icon: Buildings },
];

/** Thanh tìm việc ở "Tất cả việc làm", hai hàng: khung "ngành nghề + cái gì + ở đâu" cạnh Tất cả bộ lọc; hàng tab kèm bộ lọc đang bật, số kết quả và sắp xếp. */
export function JobFilterBar({
  value,
  total,
  onChange,
}: {
  value: JobFilterValue;
  total: number;
  onChange: (next: JobFilterValue) => void;
}) {
  const { user } = useSession();
  const filters = useJobFilters().data;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(value.q);
  const [syncedQuery, setSyncedQuery] = useState(value.q);
  if (syncedQuery !== value.q) {
    setSyncedQuery(value.q);
    setDraft(value.q);
  }

  const set = <K extends keyof JobFilterValue>(
    key: K,
    next: JobFilterValue[K],
  ) => onChange({ ...value, [key]: next });

  const toggleProvince = (code: string) =>
    set(
      "province",
      value.province.includes(code)
        ? value.province.filter((item) => item !== code)
        : [...value.province, code],
    );

  const groups = filters?.occupations ?? [];
  const remoteCode = filters?.remote.code ?? "";
  const remoteOn = Boolean(remoteCode) && value.province.includes(remoteCode);
  const occupationNames = [
    ...value.occupation.map((code) => optionName(groups, code)),
    ...value.subOccupation.map((code) => subOptionName(groups, code)),
  ];
  const hasOccupation = occupationNames.length > 0;
  const postedLabel = POSTED_STEPS.find(
    (step) => step.value === value.postedWithin,
  )?.label;
  const experienceLabel = EXPERIENCE_STEPS.find(
    (step) => step.value === value.maxYears,
  )?.label;
  const levels = SENIORITY_OPTIONS.filter((option) =>
    value.seniority.includes(option.value),
  );
  const active =
    value.province.length +
    occupationNames.length +
    (value.salaryMin ? 1 : 0) +
    (value.postedWithin ? 1 : 0) +
    (value.maxYears !== null ? 1 : 0) +
    value.seniority.length;

  let view = "all";
  if (value.saved) view = "saved";
  if (value.applied) view = "applied";
  if (value.followed) view = "followed";

  return (
    <>
      {pickerOpen && (
        <OccupationPicker
          groups={groups}
          selectedGroups={value.occupation}
          selectedSubs={value.subOccupation}
          onClose={() => setPickerOpen(false)}
          onApply={(next) => {
            setPickerOpen(false);
            onChange({
              ...value,
              occupation: next.groups,
              subOccupation: next.subs,
            });
          }}
        />
      )}
      {sheetOpen && (
        <JobFilterSheet
          value={value}
          onApply={onChange}
          onClose={() => setSheetOpen(false)}
        />
      )}

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              writeRecent(addRecent(readRecent(), draft));
              onChange({ ...value, q: draft.trim() });
            }}
            className="focus-within:border-primary-400 focus-within:ring-primary-100 grid min-w-0 flex-1 basis-full grid-cols-[minmax(0,1fr)_auto] rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 sm:flex sm:basis-0 sm:items-stretch"
          >
            <span className="hidden shrink-0 items-stretch rounded-l-[11px] border-r border-slate-200 bg-slate-50 sm:flex">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className={cn(
                  "flex h-11 max-w-52 cursor-pointer items-center gap-2 pl-3.5 text-sm font-medium",
                  hasOccupation ? "text-primary-700 pr-1" : "pr-3 text-slate-800",
                )}
              >
                <ListBullets
                  className={cn(
                    "size-4.5 shrink-0",
                    hasOccupation ? "text-primary-600" : "text-slate-500",
                  )}
                />
                <span className="truncate">
                  {summarizeNames(occupationNames) || "Ngành nghề"}
                </span>
                {!hasOccupation && (
                  <CaretDown className="size-4 shrink-0 text-slate-500" />
                )}
              </button>
              {hasOccupation && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...value, occupation: [], subOccupation: [] })
                  }
                  aria-label="Bỏ lọc ngành nghề"
                  className="text-primary-700 hover:bg-primary-100 my-auto mr-2 grid size-7 cursor-pointer place-items-center rounded-lg"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </span>
            <JobSearchBox
              query={draft}
              onQuery={setDraft}
              onSearch={(next) => set("q", next)}
              onPickOccupation={(code, sub) => {
                const key = sub ? "subOccupation" : "occupation";
                const codes = value[key].includes(code)
                  ? value[key]
                  : [...value[key], code];
                setDraft("");
                onChange({ ...value, q: "", [key]: codes });
              }}
            />
            <span className="my-2.5 hidden w-px bg-slate-200 sm:block" />
            <LocationMenu
              options={provinceChoices(filters?.provinces ?? [], value.province)}
              selected={value.province}
              remoteCode={remoteCode}
              onToggle={toggleProvince}
              onClear={() => set("province", [])}
            />
            <Button type="submit" className="col-start-2 row-start-1 m-1 h-auto">
              <MagnifyingGlass className="size-4" />
              Tìm
            </Button>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="col-start-2 row-start-2 flex cursor-pointer items-center justify-center gap-1.5 border-t border-l border-slate-200 px-4 text-sm font-medium text-slate-800 sm:hidden"
            >
              <SlidersHorizontal className="size-4.5 text-slate-400" />
              Lọc
              {active > 0 && (
                <span className="bg-primary-600 rounded-full px-1.5 text-xs font-bold text-white">
                  {active}
                </span>
              )}
            </button>
          </form>

          <Button
            variant="outline"
            className="hidden h-11 shrink-0 bg-white sm:inline-flex"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="size-4.5 text-slate-400" />
            Tất cả bộ lọc
            {active > 0 && (
              <span className="bg-primary-600 rounded-full px-1.5 text-xs font-bold text-white">
                {active}
              </span>
            )}
          </Button>
        </div>

        {(user || active > 0) && (
          <div
            className={cn(
              "mt-2 flex flex-wrap items-center gap-x-3 gap-y-2",
              user && "shadow-[inset_0_-1px_0_var(--color-slate-200)]",
            )}
          >
            {user && (
              <div role="tablist" className="flex gap-1 overflow-x-auto">
                {VIEW_TABS.map((tab) => {
                  const selected = tab.value === view;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() =>
                        onChange({
                          ...value,
                          saved: tab.value === "saved",
                          applied: tab.value === "applied",
                          followed: tab.value === "followed",
                        })
                      }
                      className={cn(
                        "flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-sm whitespace-nowrap transition-colors sm:px-3",
                        selected
                          ? "border-primary-600 font-semibold text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-800",
                      )}
                    >
                      {Icon && <Icon className="hidden size-4.5 sm:block" />}
                      <span className="sm:hidden">{tab.short ?? tab.label}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                user &&
                  "pb-0.5 sm:ml-auto sm:min-h-11 sm:justify-end",
              )}
            >
              {remoteOn && (
                <FilterChip
                  label="Từ xa"
                  onRemove={() => toggleProvince(remoteCode)}
                />
              )}
              {value.salaryMin > 0 && (
                <FilterChip
                  label={`Từ ${value.salaryMin / 1_000_000} triệu`}
                  onRemove={() => set("salaryMin", 0)}
                />
              )}
              {postedLabel && (
                <FilterChip
                  label={postedLabel}
                  onRemove={() => set("postedWithin", 0)}
                />
              )}
              {experienceLabel && (
                <FilterChip
                  label={experienceLabel}
                  onRemove={() => set("maxYears", null)}
                />
              )}
              {levels.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  onRemove={() =>
                    set(
                      "seniority",
                      value.seniority.filter((level) => level !== option.value),
                    )
                  }
                />
              ))}
              {active > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({ ...EMPTY_FILTER, q: value.q, sort: value.sort })
                  }
                >
                  Xoá lọc
                </Button>
              )}
              {active > 0 && (
              <span className="hidden h-4.5 w-px bg-slate-300 sm:block" />
            )}
              <span className="hidden items-center gap-1.5 text-sm whitespace-nowrap text-slate-500 sm:flex">
                <b data-testid="job-total" className="font-semibold text-slate-900">
                  {total.toLocaleString("vi-VN")}
                </b>
                việc làm
                {user && (
                  <>
                    <span>·</span>
                    <JobSortMenu
                      value={value.sort}
                      onChange={(next) => set("sort", next)}
                    />
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
