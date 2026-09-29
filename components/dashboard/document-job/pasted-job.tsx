"use client";

import { useDraftState } from "@/hooks/use-draft-state";
import { Input, Label, Textarea } from "@/components/ui/form";

export const MIN_JD_LENGTH = 50;

export interface PastedJob {
  jobDescription: string;
  company: string;
  title: string;
}

export interface PastedJobState {
  ready: boolean;
  value: PastedJob;
  fill: (next: PastedJob) => void;
  raw: {
    jobDescription: string;
    setJobDescription: (next: string) => void;
    company: string;
    setCompany: (next: string) => void;
    title: string;
    setTitle: (next: string) => void;
  };
}

/** Giữ ba ô của một tin dán tay, lưu được qua việc đổi tab và tải lại trang. */
export function usePastedJob(prefix: string): PastedJobState {
  const [jobDescription, setJobDescription] = useDraftState(`${prefix}-jd`);
  const [company, setCompany] = useDraftState(`${prefix}-company`);
  const [title, setTitle] = useDraftState(`${prefix}-title`);

  const value = {
    jobDescription: jobDescription.trim(),
    company: company.trim(),
    title: title.trim(),
  };

  return {
    ready:
      value.jobDescription.length >= MIN_JD_LENGTH &&
      value.company !== "" &&
      value.title !== "",
    value,
    fill: (next) => {
      setJobDescription(next.jobDescription);
      setCompany(next.company);
      setTitle(next.title);
    },
    raw: {
      jobDescription,
      setJobDescription,
      company,
      setCompany,
      title,
      setTitle,
    },
  };
}

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
