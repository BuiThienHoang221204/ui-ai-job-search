import type { ProfileRecord, SystemMatch } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";

const MIN_SCORABLE = 3;

/** Thẻ độ khớp do hệ thống tự tính (kỹ năng, địa điểm) khi chưa có điểm AI. */
export function SystemMatchCard({
  system,
  profile,
}: {
  system: SystemMatch | null;
  profile: ProfileRecord | null;
}) {
  if (!system || system.total === 0) return null;
  const count = (kind: "SKILL" | "NICE") => {
    const rows = system.checks.filter((check) => check.kind === kind);
    return { met: rows.filter((r) => r.met === true).length, total: rows.length };
  };
  const must = count("SKILL");
  const nice = count("NICE");
  const location = system.checks.find((check) => check.kind === "LOCATION");
  const farAway = location?.met === false;
  const scorable = system.total >= MIN_SCORABLE;
  if (system.kind !== "REQUIREMENTS") {
    return (
      <Card>
        <CardContent className="text-sm text-slate-500">
          Tin này chưa được phân tích yêu cầu nên chưa đối chiếu được với hồ sơ.
        </CardContent>
      </Card>
    );
  }

  return (
    <SectionCard
      compact
      title="Hệ thống đối chiếu"
      description="So yêu cầu của tin với hồ sơ, không gọi AI"
    >
      {farAway && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span className="font-semibold">
            {location?.label?.replace(/^Địa điểm:\s*/, "Công ty ở ")}
          </span>
          {profile?.location ? ` — hồ sơ bạn ghi ${profile.location}` : ""}
        </p>
      )}

      {scorable ? (
        <>
          <p className="text-sm font-semibold text-slate-800">
            Đủ {must.met}/{must.total} yêu cầu bắt buộc
          </p>

          <p className="mt-1 mb-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {system.score}% có trọng số
            </span>
            {nice.total > 0 && (
              <>
                {" · "}
                {nice.met}/{nice.total} ưu tiên
              </>
            )}
          </p>
        </>
      ) : (
        <p className="mt-1 mb-3 text-xs text-slate-500">
          Tin này chỉ nêu {system.total} yêu cầu, chưa đủ để tính tỉ lệ.
        </p>
      )}

      {system.eligibility === "FAIL" && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-900">
          Tin yêu cầu quốc tịch hoặc giấy phép lao động mà hồ sơ không đáp ứng.
        </p>
      )}

      <ul className="columns-[15rem] gap-x-6">
        {system.checks.map((check) => (
          <li
            key={`${check.kind}-${check.label}`}
            className="mb-1.5 flex break-inside-avoid items-start gap-2 text-sm"
            title={check.note}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                check.met === true && "bg-emerald-500",
                check.met === false && "bg-slate-300",
                check.met === null && "bg-amber-400",
              )}
            />
            <span
              className={cn(
                check.met === true ? "text-slate-700" : "text-slate-400",
              )}
            >
              {check.label}
              {check.kind === "NICE" && (
                <span className="ml-1 text-2xs text-slate-400">ưu tiên</span>
              )}
              {check.met === null && (
                <span className="ml-1 text-2xs text-amber-600">
                  chưa đủ dữ liệu
                </span>
              )}
              {check.kind === "LOCATION" && check.note && (
                <span className="ml-1 text-2xs text-slate-500">
                  {check.note}
                </span>
              )}
              {check.via && (
                <span className="ml-1 text-2xs text-teal-600">
                  qua từ tương đương: {check.via}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
