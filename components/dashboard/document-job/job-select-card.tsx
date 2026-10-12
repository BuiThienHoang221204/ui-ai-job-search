"use client";

import type { ReactNode } from "react";
import { MagicWand } from "@phosphor-icons/react/ssr";
import { Label } from "@/components/ui/form";
import { SelectMenu } from "@/components/ui/select-menu";
import { SectionCard } from "@/components/ui/section-card";
import { useJobOptions } from "@/hooks/use-job-options";

interface JobSelectProps {
  selectId: string;
  fixedJobId: string | null;
  value: string;
  onChange: (jobId: string) => void;
  disabled?: boolean;
  emptyOptionLabel: string;
  emptyHint: string;
}

interface JobSelectCardProps extends JobSelectProps {
  title: string;
  description: string;
  action: ReactNode;
}

/** Riêng ô chọn công việc, không kèm thẻ bao quanh; tự lấy danh sách tin qua `useJobOptions`. */
export function JobSelect({
  selectId,
  fixedJobId,
  value,
  onChange,
  disabled,
  emptyOptionLabel,
  emptyHint,
}: JobSelectProps) {
  const { options, error } = useJobOptions(fixedJobId);
  const hint = error ?? (options?.length === 0 ? emptyHint : null);

  return (
    <div className="min-w-64 flex-1">
      <Label htmlFor={selectId}>Công việc</Label>
      <SelectMenu
        id={selectId}
        variant="field"
        label={emptyOptionLabel}
        value={value}
        disabled={disabled}
        onChange={onChange}
        searchPlaceholder="Tìm vị trí hoặc công ty…"
        options={[
          { value: "", label: emptyOptionLabel },
          ...(options ?? []).map((option) => ({
            value: option.jobId,
            label: option.title,
            hint: option.company,
          })),
        ]}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Thẻ chọn công việc dùng chung cho trang CV và trang thư xin việc. */
export function JobSelectCard({
  title,
  description,
  selectId,
  fixedJobId,
  value,
  onChange,
  disabled,
  emptyOptionLabel,
  emptyHint,
  action,
}: JobSelectCardProps) {
  return (
    <SectionCard
      compact
      icon={MagicWand}
      iconClassName="size-4"
      title={title}
      description={description}
      className="border-slate-200/90"
      contentClassName="flex flex-wrap items-end gap-4 space-y-0"
    >
      <JobSelect
        selectId={selectId}
        fixedJobId={fixedJobId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        emptyOptionLabel={emptyOptionLabel}
        emptyHint={emptyHint}
      />
      {action}
    </SectionCard>
  );
}
