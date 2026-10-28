import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { CvReview } from "@/types";
import { StatusIcon } from "./status-icon";

const MISSING = <span className="text-amber-700">Máy lọc không đọc ra</span>;

/** Những trường máy lọc tách ra từ CV: trường trống là chỗ ATS sẽ để trống trong hồ sơ ứng viên. */
export function ParsedFields({
  parsed,
}: {
  parsed: NonNullable<CvReview["parsed"]>;
}) {
  const rows: Array<{ label: string; ok: boolean; value: ReactNode }> = [
    { label: "Họ tên", ok: Boolean(parsed.name), value: parsed.name },
    { label: "Email", ok: Boolean(parsed.email), value: parsed.email },
    { label: "Điện thoại", ok: Boolean(parsed.phone), value: parsed.phone },
    {
      label: "Kinh nghiệm",
      ok: parsed.jobs.length > 0,
      value: (
        <ul className="space-y-1">
          {parsed.jobs.map((job) => (
            <li key={`${job.title}-${job.company}`}>
              <b className="font-semibold text-slate-900">{job.title}</b>
              {job.company && ` · ${job.company}`}
              {job.dates ? (
                <span className="text-slate-500"> · {job.dates}</span>
              ) : (
                <span className="text-amber-700">
                  {" "}
                  · không đọc ra mốc thời gian
                </span>
              )}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Học vấn",
      ok: parsed.education.length > 0,
      value: (
        <ul className="space-y-1">
          {parsed.education.map((item) => (
            <li key={item.school}>
              <b className="font-semibold text-slate-900">{item.school}</b>
              {item.degree && ` · ${item.degree}`}
              {item.dates && (
                <span className="text-slate-500"> · {item.dates}</span>
              )}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Kỹ năng",
      ok: parsed.skills.length > 0,
      value: (
        <span className="flex flex-wrap gap-1.5">
          {parsed.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {skill}
            </span>
          ))}
        </span>
      ),
    },
  ];

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900">ATS đọc ra gì</h3>
      <p className="text-xs text-slate-500">
        Thông tin máy lọc tách từ CV để điền vào hồ sơ ứng viên. Ô nào trống thì
        nhà tuyển dụng tìm theo đó sẽ không thấy bạn.
      </p>
      <dl className="mt-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1.25rem_6.5rem_minmax(0,1fr)] gap-2 border-t border-slate-200 py-2.5 text-sm first:border-t-0"
          >
            <StatusIcon status={row.ok ? "pass" : "warn"} />
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="min-w-0 break-words text-slate-700">
              {row.ok ? row.value : MISSING}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
