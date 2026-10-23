import type {
  FilterOption,
  JobMatchWithJob,
  JobOption,
  JobRecord,
  OccupationOption,
} from "@/types";

/** Danh sách tin cho ô chọn: khi tin đã cố định chỉ cần đúng tin đó, ngược lại là các tin đã chấm điểm. */
export function jobOptionsOf(
  fixedJob: JobRecord | null | undefined,
  matches: JobMatchWithJob[] | null | undefined,
): JobOption[] | null {
  if (fixedJob) {
    return [
      { jobId: fixedJob.id, title: fixedJob.title, company: fixedJob.company },
    ];
  }
  if (!matches) return null;
  return matches.map((match) => ({
    jobId: match.jobId,
    title: match.job.title,
    company: match.job.company,
  }));
}

/** Nghề thật của một nhóm ngành để người dùng tick chọn: bỏ mục ảo "Khác" (`<NHÓM>_OTHER`) mà bộ lọc dùng cho tin chưa rõ nghề. */
export const pickableSubs = (group: OccupationOption | undefined): FilterOption[] =>
  (group?.subs ?? []).filter((sub) => sub.code !== `${group?.code}_OTHER`);
