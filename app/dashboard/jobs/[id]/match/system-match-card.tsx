import { Check } from "@phosphor-icons/react/ssr";
import type { RequirementCheck } from "@/services";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import { useJobDetail } from "@/hooks/use-job-detail";

const GROUPS = [
  { label: "Bắt buộc", kinds: ["SKILL"] },
  { label: "Ưu tiên", kinds: ["NICE"] },
  { label: "Điều kiện khác", kinds: ["YEARS", "LOCATION", "ELIGIBILITY"] },
] as const;

const metCount = (checks: RequirementCheck[]) =>
  checks.filter((check) => check.met === true).length;

/** Một yêu cầu dạng chip: xanh có dấu ✓ khi hồ sơ đáp ứng, viền xám khi chưa, vàng khi chưa đủ dữ liệu. */
function CheckChip({
  check,
  location,
}: {
  check: RequirementCheck;
  location: string | null;
}) {
  const label = check.label.replace(/^Địa điểm:\s*/, "");
  const extra =
    check.met === null
      ? "chưa đủ dữ liệu"
      : check.kind === "LOCATION" && check.met === false && location
        ? `bạn ở ${location}`
        : check.via
          ? `qua ${check.via}`
          : null;

  return (
    <span
      title={check.note}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm",
        check.met === true &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        check.met === false && "border-slate-200 bg-white text-slate-500",
        check.met === null && "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      {check.met === true && <Check weight="bold" className="size-3.5" />}
      {label}
      {extra && <span className="text-xs opacity-75">· {extra}</span>}
    </span>
  );
}

/** Thẻ "Đối chiếu yêu cầu": yêu cầu của tin so với hồ sơ, chia nhóm bắt buộc / ưu tiên / điều kiện khác. */
export function SystemMatchCard({ jobId }: { jobId: string }) {
  const { data } = useJobDetail(jobId);
  const system = data?.job.systemMatch ?? null;
  const location = data?.job.profileLocation ?? null;
  if (!system || system.total === 0) return null;

  if (system.kind !== "REQUIREMENTS") {
    return (
      <Card id="doi-chieu" className="scroll-mt-20 p-6 text-sm text-slate-500">
        Tin này chưa được phân tích yêu cầu nên chưa đối chiếu được với hồ sơ.
      </Card>
    );
  }

  const must = system.checks.filter((check) => check.kind === "SKILL");
  const missing = system.checks.some(
    (check) =>
      check.met === false && (check.kind === "SKILL" || check.kind === "NICE"),
  );

  return (
    <Card id="doi-chieu" className="scroll-mt-20 p-6">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Đối chiếu yêu cầu
          </h2>
          <p className="text-sm text-slate-500">
            Từng yêu cầu của tin so với hồ sơ của bạn, hệ thống tự so, không gọi
            AI.
          </p>
        </div>
        {must.length > 0 && (
          <p className="text-sm font-semibold text-slate-800">
            Đáp ứng {metCount(must)}/{must.length} bắt buộc
          </p>
        )}
      </div>

      {system.eligibility === "FAIL" && (
        <p className="my-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-900">
          Tin yêu cầu quốc tịch hoặc giấy phép lao động mà hồ sơ không đáp ứng.
        </p>
      )}

      {GROUPS.map((group) => {
        const checks = system.checks.filter((check) =>
          (group.kinds as readonly string[]).includes(check.kind),
        );
        if (checks.length === 0) return null;
        return (
          <div
            key={group.label}
            className="grid gap-x-5 gap-y-2 border-t border-slate-100 py-3.5 sm:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <p className="text-sm font-semibold text-slate-900">
              {group.label}
              {group.kinds[0] !== "YEARS" && (
                <span className="block text-xs font-normal text-slate-500">
                  {metCount(checks)}/{checks.length} có trong hồ sơ
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {checks.map((check) => (
                <CheckChip
                  key={`${check.kind}-${check.label}`}
                  check={check}
                  location={location}
                />
              ))}
            </div>
          </div>
        );
      })}

      {missing && (
        <p className="mt-1 rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-slate-700">
          Hệ thống lọc hồ sơ so khớp theo đúng từ khoá. Kỹ năng bạn thật sự có
          mà đang bị đánh thiếu ở đây thì nên ghi rõ vào CV để dễ qua vòng lọc.
        </p>
      )}
    </Card>
  );
}
