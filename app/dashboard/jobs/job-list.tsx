"use client";

import type { Job } from "@/types";
import { JobRow } from "./job-row";
/** Danh sách thẻ việc làm. */
export function JobList({
  jobs,
  selectedId,
  onSelect,
  onSavedChange,
}: {
  jobs: Job[];
  selectedId: string | null;
  onSelect: (jobId: string) => void;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}) {
  return (
    <ul className="divide-y divide-slate-100">
      {jobs.map((job) => (
        <JobRow
          key={job.id}
          job={job}
          selected={job.id === selectedId}
          onSelect={onSelect}
          onSavedChange={onSavedChange}
        />
      ))}
    </ul>
  );
}
