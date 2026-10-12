"use client";

import { useDraftState } from "@/hooks/use-draft-state";
import type { PastedJobState } from "@/types";

export const MIN_JD_LENGTH = 50;

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
