"use client";

import { Label } from "@/components/ui/form";
import { SelectMenu } from "@/components/ui/select-menu";
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
