"use client";

import { useMemo, useState } from "react";
import { Check, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { OccupationOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { fold } from "@/lib/text";

interface OccupationPickerProps {
  groups: OccupationOption[];
  selectedGroups: string[];
  selectedSubs: string[];
  onApply: (next: { groups: string[]; subs: string[] }) => void;
  onClose: () => void;
}

const leavesOf = (group: OccupationOption) =>
  group.subs?.length ? group.subs.map((sub) => sub.code) : [group.code];

/** Mở mã nhóm đã chọn thành từng nghề, để mỗi ô chỉ cần hỏi "có trong tập không". */
function expand(groups: OccupationOption[], selectedGroups: string[], selectedSubs: string[]) {
  const picked = new Set(selectedSubs);
  for (const group of groups) {
    if (!selectedGroups.includes(group.code)) continue;
    for (const code of leavesOf(group)) picked.add(code);
  }
  return picked;
}

/** Nhóm tích đủ mọi nghề thì gửi mã nhóm, còn lại gửi từng nghề, vì backend lọc nhóm AND nghề. */
function collapse(groups: OccupationOption[], picked: Set<string>) {
  const next = { groups: [] as string[], subs: [] as string[] };
  for (const group of groups) {
    const leaves = leavesOf(group);
    if (leaves.every((code) => picked.has(code))) {
      next.groups.push(group.code);
      continue;
    }
    next.subs.push(...leaves.filter((code) => picked.has(code)));
  }
  return next;
}

/** Bộ chọn ngành nghề theo nhóm và nghề con; chỉ mount khi mở nên mỗi lần mở là một bản nháp mới. */
export function OccupationPicker({
  groups,
  selectedGroups,
  selectedSubs,
  onApply,
  onClose,
}: OccupationPickerProps) {
  const [needle, setNeedle] = useState("");
  const [activeGroup, setActiveGroup] = useState(groups[0]?.code ?? "");
  const [picked, setPicked] = useState(() =>
    expand(groups, selectedGroups, selectedSubs),
  );

  const leavesByGroup = useMemo(
    () => new Map(groups.map((group) => [group.code, leavesOf(group)])),
    [groups],
  );

  const matching = useMemo(() => {
    const term = fold(needle.trim());
    if (!term) return null;
    return groups
      .map((group) => ({
        ...group,
        subs: (group.subs ?? []).filter((sub) => fold(sub.name).includes(term)),
      }))
      .filter(
        (group) => group.subs.length > 0 || fold(group.name).includes(term),
      );
  }, [groups, needle]);

  const visibleGroups = matching ?? groups;
  const current =
    visibleGroups.find((group) => group.code === activeGroup) ??
    visibleGroups[0];

  const groupChecked = (code: string) =>
    (leavesByGroup.get(code) ?? []).every((leaf) => picked.has(leaf));

  const toggleGroup = (code: string) => {
    const next = new Set(picked);
    const checked = groupChecked(code);
    for (const leaf of leavesByGroup.get(code) ?? []) {
      if (checked) next.delete(leaf);
      else next.add(leaf);
    }
    setPicked(next);
  };

  const toggleSub = (code: string) => {
    const next = new Set(picked);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setPicked(next);
  };

  const selection = collapse(groups, picked);
  const total = selection.groups.length + selection.subs.length;

  return (
    <Modal
      open
      onClose={onClose}
      title="Chọn ngành nghề"
      className="flex h-[min(36rem,90vh)] max-w-3xl flex-col overflow-hidden"
      bodyClassName="flex min-h-0 flex-1 flex-col px-0 pb-0"
    >
      <div className="border-y border-slate-100 px-5 py-3">
        <div className="relative">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
            placeholder="Tìm ngành nghề…"
            className="focus:border-primary-400 focus:ring-primary-100 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 text-sm outline-none focus:bg-white focus:ring-2"
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="scrollbar-thin overflow-y-auto border-r border-slate-100 py-2">
          <p className="px-5 pb-1 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
            Nhóm ngành
          </p>
          {visibleGroups.map((group) => {
            const checked = groupChecked(group.code);
            return (
              <button
                key={group.code}
                type="button"
                onMouseEnter={() => setActiveGroup(group.code)}
                onClick={() => setActiveGroup(group.code)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 px-5 py-2 text-left text-sm transition-colors",
                  current?.code === group.code
                    ? "bg-primary-50 text-primary-800"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleGroup(group.code);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    event.stopPropagation();
                    toggleGroup(group.code);
                  }}
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-slate-300",
                  )}
                >
                  {checked && <Check className="size-3.5" />}
                </span>
                <span className="min-w-0 flex-1 truncate">{group.name}</span>
                <span className="text-xs text-slate-400">{group.count}</span>
              </button>
            );
          })}
        </div>

        <div className="scrollbar-thin overflow-y-auto py-2">
          <p className="px-5 pb-1 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
            Nghề
          </p>
          {current?.subs?.length ? (
            current.subs.map((sub) => {
              const checked = picked.has(sub.code);
              return (
                <button
                  key={sub.code}
                  type="button"
                  onClick={() => toggleSub(sub.code)}
                  aria-pressed={checked}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      checked
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-slate-300",
                    )}
                  >
                    {checked && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                  <span className="text-xs text-slate-400">{sub.count}</span>
                </button>
              );
            })
          ) : (
            <p className="px-5 py-3 text-sm text-slate-400">
              Nhóm này chưa tách nghề chi tiết. Tích cả nhóm ở cột bên trái.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <Button variant="ghost" size="sm" onClick={() => setPicked(new Set())}>
          Bỏ chọn tất cả
          {total > 0 && (
            <span className="bg-primary-100 text-primary-700 ml-1.5 rounded-full px-1.5 text-xs font-semibold">
              {total}
            </span>
          )}
        </Button>
        <Button variant="primary" size="sm" onClick={() => onApply(selection)}>
          <Check className="size-4.5" />
          Áp dụng
        </Button>
      </div>
    </Modal>
  );
}
