"use client";

import { useState } from "react";
import { Briefcase, HouseLine } from "@phosphor-icons/react/ssr";
import type { JobFilterValue } from "@/types";
import {
  BottomSheet,
  SheetChip,
  SheetSection,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  optionName,
  provinceChoices,
  subOptionName,
} from "@/lib/job-filter-url";
import { useSession } from "@/hooks/use-session";
import { useJobFilters } from "@/hooks/use-job-filters";
import { OccupationPicker } from "./occupation-picker";
import { EMPTY_FILTER, POSTED_STEPS, SALARY_STEPS } from "./job-filter-options";

/** "Tất cả bộ lọc": gom mọi bộ lọc dạng chip, chỉ áp dụng khi bấm "Áp dụng"; bottom sheet trên mobile, ngăn kéo phải từ `sm`. */
export function JobFilterSheet({
  value,
  onApply,
  onClose,
}: {
  value: JobFilterValue;
  onApply: (next: JobFilterValue) => void;
  onClose: () => void;
}) {
  const { user } = useSession();
  const filters = useJobFilters().data;
  const occupations = filters?.occupations ?? [];
  const remoteCode = filters?.remote.code ?? "";
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
    ...draft.occupation.map((code) => optionName(occupations, code)),
    ...draft.subOccupation.map((code) => subOptionName(occupations, code)),
  ];
  const provinceOptions = provinceChoices(
    filters?.provinces ?? [],
    draft.province,
  );

  return (
    <>
      <BottomSheet
        title="Tất cả bộ lọc"
        onClose={onClose}
        drawer
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
        {remoteCode && (
          <SheetSection title="Hình thức">
            <SheetChip
              active={draft.province.includes(remoteCode)}
              onClick={() => toggleProvince(remoteCode)}
            >
              <HouseLine className="size-4" />
              Chỉ việc làm từ xa
            </SheetChip>
          </SheetSection>
        )}

        {user && (
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
