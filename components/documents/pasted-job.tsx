"use client";

import { MIN_JD_LENGTH } from "@/hooks/use-pasted-job";
import type { PastedJobState } from "@/types";
import { Input, Label, Textarea } from "@/components/ui/form";

/** Phần hiển thị của `usePastedJob`: tên công ty, vị trí và nội dung JD do người dùng nhập. */
export function PastedJobFields({
  idPrefix,
  state,
  disabled,
  rows = 10,
  readyHint,
}: {
  idPrefix: string;
  state: PastedJobState;
  disabled: boolean;
  rows?: number;
  readyHint: string;
}) {
  const { raw, value } = state;
  const length = value.jobDescription.length;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${idPrefix}-jd`}>Mô tả công việc (JD)</Label>
        <Textarea
          id={`${idPrefix}-jd`}
          rows={rows}
          value={raw.jobDescription}
          disabled={disabled}
          onChange={(event) => raw.setJobDescription(event.target.value)}
          placeholder="Dán toàn bộ mô tả công việc vào đây: yêu cầu, mô tả công việc, quyền lợi…"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {length < MIN_JD_LENGTH
            ? `Cần ít nhất ${MIN_JD_LENGTH} ký tự — càng đầy đủ thì tài liệu càng bám đúng yêu cầu (đang có ${length}).`
            : `${length} ký tự. ${readyHint}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-company`}>Công ty</Label>
          <Input
            id={`${idPrefix}-company`}
            value={raw.company}
            disabled={disabled}
            onChange={(event) => raw.setCompany(event.target.value)}
            placeholder="Công ty TNHH ABC"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-title`}>Vị trí ứng tuyển</Label>
          <Input
            id={`${idPrefix}-title`}
            value={raw.title}
            disabled={disabled}
            onChange={(event) => raw.setTitle(event.target.value)}
            placeholder="Kế toán tổng hợp"
          />
        </div>
      </div>
    </div>
  );
}
