import type {
  Job,
  JobMatchWithJob,
  JobTimestamp,
  SalaryCurrency,
  SalaryRange,
} from "@/types";
import type { JobListItem } from "@/services";
import {
  companyColor,
  companyInitials,
  relativeDay,
  relativeTime,
} from "@/utils";

type RawSalary = Pick<
  JobMatchWithJob["job"],
  "salaryMin" | "salaryMax" | "currency"
>;

type RawTiming = Pick<JobMatchWithJob["job"], "postedAt" | "scrapedAt">;

/** Chọn mốc thời gian để hiển thị (ngày đăng, nếu không có thì ngày thu thập) kèm nhãn nguồn. */
export function toJobTimestamp(job: RawTiming): JobTimestamp {
  if (job.postedAt) {
    return {
      label: relativeDay(job.postedAt),
      source: "posted",
      at: job.postedAt,
    };
  }
  return {
    label: relativeTime(job.scrapedAt),
    source: "scraped",
    at: job.scrapedAt,
  };
}

/** Đơn vị tiền tệ có phải VND hoặc USD hay không. */
const isCurrency = (value: string | null): value is SalaryCurrency =>
  value === "VND" || value === "USD";

/** Dựng khoảng lương khi có đủ min, max và đơn vị tiền tệ; thiếu thì trả null. */
export function toSalaryRange(job: RawSalary): SalaryRange | null {
  return job.salaryMin !== null &&
    job.salaryMax !== null &&
    isCurrency(job.currency)
    ? {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.currency,
        period: "month" as const,
      }
    : null;
}

/** Phần dùng chung của hai bộ chuyển đổi — mọi thứ trừ điểm phù hợp. */
function toCardBase(
  job: JobMatchWithJob["job"],
): Omit<Job, "aiMatch" | "systemMatch" | "hasAiScore" | "strengths"> {
  return {
    id: job.id,
    company: job.company,
    companyInitials: companyInitials(job.company),
    companyColor: companyColor(job.company),
    companyLogo: job.companyLogo,
    title: job.title,
    location: job.location ?? "Không rõ",
    salary: toSalaryRange(job),
    salaryRaw: job.salaryRaw,
    tags: [...new Set(job.tags)],
    postedAt: toJobTimestamp(job),
    saved: job.saved,
  };
}

/** Chuyển một kết quả chấm điểm của backend thành thẻ công việc của giao diện. */
export function toJobCard(match: JobMatchWithJob): Job {
  return {
    ...toCardBase(match.job),
    aiMatch: match.overallScore,
    systemMatch: null,
    strengths: match.strengths.slice(0, 2),
    hasAiScore: match.status === "DONE",
  };
}

/** Chuyển một tin thô từ `GET /jobs` (chưa chấm điểm) thành thẻ công việc. */
export function toJobCardFromRecord(job: JobListItem): Job {
  return {
    ...toCardBase(job),
    aiMatch: null,
    strengths: [],
    systemMatch: job.systemMatch
      ? {
          kind: job.systemMatch.kind,
          met: job.systemMatch.met,
          total: job.systemMatch.total,
          percent: job.systemMatch.score,
        }
      : null,
    hasAiScore: job.match?.status === "DONE",
  };
}
