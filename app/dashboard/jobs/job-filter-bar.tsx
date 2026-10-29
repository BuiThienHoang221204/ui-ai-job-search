"use client";

import { useState } from "react";
import {
  Bookmark,
  Briefcase,
  Buildings,
  CalendarDots,
  CaretDown,
  Check,
  Funnel,
  MapPin,
  Money,
  PaperPlaneRight,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type {
  FilterOption,
  JobFilters,
  JobFilterValue,
  OccupationOption,
} from "@/types";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { SearchInput } from "@/components/ui/search-input";
import { SelectMenu } from "@/components/ui/select-menu";
import { OccupationPicker } from "./occupation-picker";
import { cn } from "@/lib/cn";
import { useSession } from "@/hooks/use-session";
import { useDropdown } from "@/hooks/use-dropdown";
import { JobFilterSheet } from "./job-filter-sheet";
import { EMPTY_FILTER, POSTED_STEPS, SALARY_STEPS } from "./job-filter-options";

/** Thanh bộ lọc việc làm: các dropdown lọc, công tắc, sắp xếp và chip đang bật. */
export function JobFilterBar({
  value,
  filters,
  onChange,
}: {
  value: JobFilterValue;

  filters: JobFilters | null;
  onChange: (next: JobFilterValue) => void;
}) {
  const { user } = useSession();
  const set = <K extends keyof JobFilterValue>(
    key: K,
    next: JobFilterValue[K],
  ) => onChange({ ...value, [key]: next });

  const toggle = (
    key: "province" | "occupation" | "subOccupation",
    code: string,
  ) => {
    const current = value[key];
    set(
      key,
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const provinceOptions = filters
    ? [filters.remote, ...filters.provinces]
        .filter(
          (option) => option.count > 0 || value.province.includes(option.code),
        )
        .sort((a, b) => b.count - a.count)
    : [];

  const active =
    value.province.length +
    value.occupation.length +
    value.subOccupation.length +
    (value.salaryMin ? 1 : 0) +
    (value.postedWithin ? 1 : 0) +
    (value.saved ? 1 : 0) +
    (value.applied ? 1 : 0) +
    (value.followed ? 1 : 0);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const secondary =
    value.occupation.length +
    value.subOccupation.length +
    (value.salaryMin ? 1 : 0) +
    (value.postedWithin ? 1 : 0) +
    (value.saved ? 1 : 0) +
    (value.applied ? 1 : 0) +
    (value.followed ? 1 : 0);

  const [moreOpen, setMoreOpen] = useState(secondary > 0);
  const [clearing, setClearing] = useState(false);
  if (clearing && active === 0) setClearing(false);
  const showChips = active > 0 && !clearing;

  const clearAll = () =>
    onChange({ ...EMPTY_FILTER, q: value.q, sort: value.sort });

  return (
    <>
      {pickerOpen && filters && (
        <OccupationPicker
          groups={filters.occupations}
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
      {sheetOpen && filters && (
        <JobFilterSheet
          value={value}
          provinceOptions={provinceOptions}
          occupations={filters.occupations}
          showAccount={Boolean(user)}
          onApply={onChange}
          onClose={() => setSheetOpen(false)}
        />
      )}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            className="min-w-0 flex-1"
            value={value.q}
            onChange={(next) => set("q", next)}
            placeholder="Vị trí tuyển dụng, tên công ty…"
          />

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm sm:hidden"
          >
            <Funnel className="size-4.5 text-slate-400" />
            Bộ lọc
            {active > 0 && (
              <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
                {active}
              </span>
            )}
          </button>

          <MultiSelect
            label="Địa điểm"
            icon={MapPin}
            align="right"
            className="hidden sm:block sm:w-60"
            options={provinceOptions}
            selected={value.province}
            onToggle={(code) => toggle("province", code)}
            onClear={() => set("province", [])}
            searchPlaceholder="Nhập Tỉnh/Thành phố"
          />

          <TriggerButton
            className="hidden sm:flex"
            icon={Funnel}
            label="Bộ lọc"
            active={secondary > 0}
            open={moreOpen}
            onClick={() => setMoreOpen(!moreOpen)}
          >
            {secondary > 0 && (
              <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
                {secondary}
              </span>
            )}
          </TriggerButton>
        </div>

        <div
          inert={!moreOpen}
          className={cn(
            "hidden transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none sm:grid",
            moreOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div
            className={cn(
              "min-h-0",
              moreOpen ? "reveal-overflow" : "overflow-hidden",
            )}
          >
            <div className="flex flex-wrap items-center gap-2 pt-2.5">
              {user && (
                <>
                  <Toggle
                    label="Đã lưu"
                    icon={Bookmark}
                    active={value.saved}
                    onClick={() => set("saved", !value.saved)}
                  />
                  <Toggle
                    label="Đã ứng tuyển"
                    icon={PaperPlaneRight}
                    active={value.applied}
                    onClick={() => set("applied", !value.applied)}
                  />
                  <Toggle
                    label="Công ty theo dõi"
                    icon={Buildings}
                    active={value.followed}
                    onClick={() => set("followed", !value.followed)}
                  />
                </>
              )}

              <TriggerButton
                icon={Briefcase}
                label="Ngành nghề"
                active={
                  value.occupation.length + value.subOccupation.length > 0
                }
                open={pickerOpen}
                onClick={() => setPickerOpen(true)}
              >
                {value.occupation.length + value.subOccupation.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
                    {value.occupation.length + value.subOccupation.length}
                  </span>
                )}
              </TriggerButton>
              {user && (
                <SelectMenu
                  label="Mọi mức lương"
                  icon={Money}
                  value={value.salaryMin}
                  onChange={(next) => set("salaryMin", next)}
                  options={[
                    { value: 0, label: "Mọi mức lương" },
                    ...SALARY_STEPS.map((step) => ({
                      value: step * 1_000_000,
                      label: `Từ ${step} triệu`,
                    })),
                  ]}
                />
              )}

              <SelectMenu
                label="Mọi thời điểm"
                icon={CalendarDots}
                value={value.postedWithin}
                onChange={(next) => set("postedWithin", next)}
                options={[
                  { value: 0, label: "Mọi thời điểm" },
                  ...POSTED_STEPS.map((step) => ({
                    value: step.value,
                    label: step.label,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        <div
          inert={!showChips}
          onTransitionEnd={(event) => {
            if (
              clearing &&
              event.target === event.currentTarget &&
              event.propertyName === "grid-template-rows"
            ) {
              clearAll();
            }
          }}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
            showChips
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 pt-2.5">
              {value.province.map((code) => (
                <FilterChip
                  key={`province-${code}`}
                  label={labelOf(provinceOptions, code)}
                  onRemove={() => toggle("province", code)}
                />
              ))}
              {value.occupation.map((code) => (
                <FilterChip
                  key={`occupation-${code}`}
                  label={labelOf(filters?.occupations ?? [], code)}
                  onRemove={() => toggle("occupation", code)}
                />
              ))}
              {value.subOccupation.map((code) => (
                <FilterChip
                  key={`sub-${code}`}
                  label={subLabelOf(filters?.occupations ?? [], code)}
                  onRemove={() => toggle("subOccupation", code)}
                />
              ))}
              {value.saved && (
                <FilterChip
                  label="Đã lưu"
                  onRemove={() => set("saved", false)}
                />
              )}
              {value.applied && (
                <FilterChip
                  label="Đã ứng tuyển"
                  onRemove={() => set("applied", false)}
                />
              )}
              {value.followed && (
                <FilterChip
                  label="Công ty theo dõi"
                  onRemove={() => set("followed", false)}
                />
              )}
              {value.salaryMin > 0 && (
                <FilterChip
                  label={`Từ ${value.salaryMin / 1_000_000} triệu`}
                  onRemove={() => set("salaryMin", 0)}
                />
              )}
              {value.postedWithin > 0 && (
                <FilterChip
                  label={`Đăng trong ${value.postedWithin} ngày`}
                  onRemove={() => set("postedWithin", 0)}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    window.matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                  )
                    clearAll();
                  else setClearing(true);
                }}
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
/** Nút bật/tắt một bộ lọc dạng boolean. */
function Toggle({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: PhosphorIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-sm shadow-sm transition-colors",
        active
          ? "border-primary-400 bg-primary-50 text-primary-700"
          : "border-slate-200 bg-white text-slate-700",
      )}
    >
      <Icon
        className={cn(
          "size-4.5 shrink-0",
          active ? "text-primary-500" : "text-slate-400",
        )}
      />
      {label}
    </button>
  );
}
/** Tìm tên hiển thị của một mã trong danh sách lựa chọn. */
const labelOf = (options: FilterOption[], code: string) =>
  options.find((option) => option.code === code)?.name ?? code;

/** Tìm tên hiển thị của một mã nghề con trong các nhóm nghề. */
const subLabelOf = (groups: OccupationOption[], code: string) =>
  groups.flatMap((group) => group.subs ?? []).find((sub) => sub.code === code)
    ?.name ?? code;

/** Nút bấm mở một dropdown bộ lọc. */
function TriggerButton({
  icon: Icon,
  label,
  active,
  open,
  onClick,
  className,
  children,
}: {
  icon: PhosphorIcon;
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-sm whitespace-nowrap shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "border-primary-400 text-primary-700"
          : "border-slate-200 text-slate-700",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-4.5 shrink-0",
          active ? "text-primary-500" : "text-slate-400",
        )}
      />
      {label}
      {children}
      <CaretDown className="size-4.5 shrink-0 text-slate-400" />
    </button>
  );
}
/** Dropdown chọn nhiều giá trị cho một bộ lọc. */
function MultiSelect({
  label,
  icon: Icon,
  className,
  align = "left",
  options,
  selected,
  onToggle,
  onClear,
  searchPlaceholder,
}: {
  label: string;
  icon: PhosphorIcon;
  className?: string;

  align?: "left" | "right";
  options: FilterOption[];
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
  searchPlaceholder: string;
}) {
  const { open, setOpen, root } = useDropdown();
  const [needle, setNeedle] = useState("");

  const normalized = needle.trim().toLowerCase();
  const visible = normalized
    ? options.filter((option) => option.name.toLowerCase().includes(normalized))
    : options;

  return (
    <div ref={root} className={cn("relative", className)}>
      <TriggerButton
        className="w-full"
        icon={Icon}
        label={label}
        active={selected.length > 0}
        open={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selected.length > 0 && (
          <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
            {selected.length}
          </span>
        )}
      </TriggerButton>

      {open && (
        <div
          className={cn(
            "absolute top-11 z-20 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <input
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
            placeholder={searchPlaceholder}
            className="focus:border-primary-400 mb-2 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none"
          />

          <ul className="max-h-64 overflow-y-auto">
            {visible.map((option) => {
              const checked = selected.includes(option.code);
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    onClick={() => onToggle(option.code)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-slate-300",
                      )}
                    >
                      {checked && <Check className="size-3.5" />}
                    </span>
                    <span className="flex-1 truncate text-slate-700">
                      {option.name}
                    </span>
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-2 py-6 text-center text-xs text-slate-400">
                Không có mục nào khớp
              </li>
            )}
          </ul>

          <div className="mt-1 flex justify-between border-t border-slate-100 pt-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Bỏ chọn tất cả
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
