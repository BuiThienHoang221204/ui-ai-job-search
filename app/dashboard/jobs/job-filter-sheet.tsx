"use client";

import { useState } from "react";
import { Briefcase } from "@phosphor-icons/react/ssr";
import type { FilterOption, JobFilterValue, OccupationOption } from "@/types";
import {
  BottomSheet,
  SheetChip,
  SheetSection,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { OccupationPicker } from "./occupation-picker";
import { EMPTY_FILTER, POSTED_STEPS, SALARY_STEPS } from "./job-filter-options";

const subLabelOf = (groups: OccupationOption[], code: string) =>
  groups.flatMap((group) => group.subs ?? []).find((sub) => sub.code === code)
    ?.name ?? code;

/** Bottom sheet chọn bộ lọc việc làm trên mobile: gom hết bộ lọc dạng chip, chỉ áp dụng khi bấm "Áp dụng". */
export function JobFilterSheet({
  value,
  provinceOptions,
  occupations,
  showAccount,
  onApply,
  onClose,
}: {
  value: JobFilterValue;
  provinceOptions: FilterOption[];
  occupations: OccupationOption[];
  showAccount: boolean;
  onApply: (next: JobFilterValue) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [pickerOpen, setPickerOpen] = useState(false);

  const toggleProvince = (code: string) =>
    setDraft((current) => ({
      ...current,
      province: current.province.includes(code)
        ? current.province.filter((item) => item !== code)
        : [...current.province, code],
    }));

  const occLabels = [
    ...draft.occupation.map(
      (code) => occupations.find((group) => group.code === code)?.name ?? code,
    ),
    ...draft.subOccupation.map((code) => subLabelOf(occupations, code)),
  ];

  return (
    <>
      <BottomSheet
        title="Bộ lọc"
        onClose={onClose}
        footer={
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                setDraft({ ...EMPTY_FILTER, q: value.q, sort: value.sort })
              }
            >
              Xoá lọc
            </Button>
            <Button
              className="flex-[2]"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
            >
              Áp dụng
            </Button>
          </div>
        }
      >
        <SheetSection title="Địa điểm">
          {provinceOptions.map((option) => (
            <SheetChip
              key={option.code}
              active={draft.province.includes(option.code)}
              onClick={() => toggleProvince(option.code)}
            >
              {option.name}
            </SheetChip>
          ))}
        </SheetSection>

        <SheetSection title="Ngành nghề">
          {occLabels.map((label) => (
            <SheetChip key={label} active onClick={() => setPickerOpen(true)}>
              {label}
            </SheetChip>
          ))}
          <SheetChip onClick={() => setPickerOpen(true)}>
            <Briefcase className="size-4" />
            {occLabels.length > 0 ? "Chỉnh ngành nghề" : "Chọn ngành nghề"}
          </SheetChip>
        </SheetSection>

        {showAccount && (
          <SheetSection title="Mức lương">
            <SheetChip
              active={draft.salaryMin === 0}
              onClick={() => setDraft((c) => ({ ...c, salaryMin: 0 }))}
            >
              Mọi mức lương
            </SheetChip>
            {SALARY_STEPS.map((step) => (
              <SheetChip
                key={step}
                active={draft.salaryMin === step * 1_000_000}
                onClick={() =>
                  setDraft((c) => ({ ...c, salaryMin: step * 1_000_000 }))
                }
              >
                Từ {step} triệu
              </SheetChip>
            ))}
          </SheetSection>
        )}

        <SheetSection title="Thời điểm đăng">
          <SheetChip
            active={draft.postedWithin === 0}
            onClick={() => setDraft((c) => ({ ...c, postedWithin: 0 }))}
          >
            Mọi thời điểm
          </SheetChip>
          {POSTED_STEPS.map((step) => (
            <SheetChip
              key={step.value}
              active={draft.postedWithin === step.value}
              onClick={() =>
                setDraft((c) => ({ ...c, postedWithin: step.value }))
              }
            >
              {step.label}
            </SheetChip>
          ))}
        </SheetSection>

        {showAccount && (
          <SheetSection title="Lọc nhanh">
            <SheetChip
              active={draft.saved}
              onClick={() => setDraft((c) => ({ ...c, saved: !c.saved }))}
            >
              Đã lưu
            </SheetChip>
            <SheetChip
              active={draft.applied}
              onClick={() => setDraft((c) => ({ ...c, applied: !c.applied }))}
            >
              Đã ứng tuyển
            </SheetChip>
            <SheetChip
              active={draft.followed}
              onClick={() => setDraft((c) => ({ ...c, followed: !c.followed }))}
            >
              Công ty theo dõi
            </SheetChip>
          </SheetSection>
        )}
      </BottomSheet>

      {pickerOpen && (
        <OccupationPicker
          groups={occupations}
          selectedGroups={draft.occupation}
          selectedSubs={draft.subOccupation}
          onClose={() => setPickerOpen(false)}
          onApply={(next) => {
            setPickerOpen(false);
            setDraft((c) => ({
              ...c,
              occupation: next.groups,
              subOccupation: next.subs,
            }));
          }}
        />
      )}
    </>
  );
}
