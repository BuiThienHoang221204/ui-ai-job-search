import Link from "next/link";
import type { JobMatchCard } from "@/types";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { LocationText } from "@/components/jobs/location-text";
import { toJobCard } from "@/lib/adapters";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/date";
import { formatJobSalary } from "@/lib/salary";
import { MATCH_VERDICTS, matchTone, matchToneClasses } from "@/lib/score";

/** Một dòng tin đã chấm trên mobile: bấm cả dòng mở chi tiết, điểm AI ở bên phải. */
export function MatchRow({ match }: { match: JobMatchCard }) {
  const job = toJobCard(match);
  const score = job.aiMatch;
  const verdict = score === null ? "" : MATCH_VERDICTS[matchTone(score)];
  const tone = score === null ? null : matchToneClasses(score);

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <Link
        href={`/dashboard/jobs/${job.id}`}
        className="flex gap-3 px-4 py-3.5 transition-colors active:bg-slate-50"
      >
        <CompanyLogo src={job.companyLogo} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-xs text-slate-500">{job.company}</span>
          <span className="line-clamp-2 text-sm font-semibold tracking-tight text-slate-900">
            {job.title}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-xs text-slate-500">
            <span className="shrink-0 font-semibold text-slate-800">
              {formatJobSalary(job)}
            </span>
            <span aria-hidden>·</span>
            <LocationText location={job.location} className="min-w-0" />
          </span>
          {job.strengths.length > 0 && (
            <span className="mt-1 line-clamp-2 text-xs text-slate-600">
              {job.strengths[0]}
            </span>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-center gap-1">
          {tone && (
            <span
              title={`Điểm AI: ${verdict}`}
              className={cn(
                "grid size-10 place-items-center rounded-full text-sm font-bold tabular-nums",
                tone.bg,
                tone.text,
              )}
            >
              {score}
              <span className="sr-only">điểm AI, {verdict}</span>
            </span>
          )}
          {match.evaluatedAt && (
            <span
              title="Lúc AI chấm điểm"
              className="text-3xs whitespace-nowrap text-slate-400"
            >
              {relativeTime(match.evaluatedAt)}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
