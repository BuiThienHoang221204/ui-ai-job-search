import Link from "next/link";
import { Coins } from "@phosphor-icons/react/ssr";
import type { SalaryGuide } from "@/services";
import { SectionCard } from "@/components/ui/section-card";
import { formatMonthlyVnd } from "@/utils";

function Amount({
  caption,
  value,
  hint,
  strong,
}: {
  caption: string;
  value: number;
  hint: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "flex-1 rounded-lg bg-primary-50 px-3 py-2.5 text-center"
          : "flex-1 rounded-lg bg-slate-50 px-3 py-2.5 text-center"
      }
    >
      <p className="text-2xs font-medium text-slate-500">{caption}</p>
      <p
        className={
          strong
            ? "mt-0.5 font-mono text-base font-bold text-primary-700"
            : "mt-0.5 font-mono text-sm font-semibold text-slate-700"
        }
      >
        {formatMonthlyVnd(value)}
      </p>
      <p className="mt-0.5 text-3xs leading-tight text-slate-400">{hint}</p>
    </div>
  );
}

function basisLine(guide: SalaryGuide) {
  if (guide.basis === "POSITION") {
    return `Tính theo mặt bằng vị trí ${guide.label}`;
  }
  return `Chưa nhận ra chức danh cụ thể trong tiêu đề tin, nên lấy mức chung của ${guide.positionCount} vị trí gần nhất: ${guide.label}`;
}

const years = (value: number) =>
  `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} năm`;

function experienceLine(guide: SalaryGuide) {
  if (!guide.experienceLabel) {
    return "Chưa biết số năm kinh nghiệm của bạn lẫn của tin — dùng mức chung của vị trí";
  }
  if (guide.experienceSource === "PROFILE") {
    const own = guide.candidateYears !== null ? ` (${years(guide.candidateYears)})` : "";
    return `Tính theo kinh nghiệm trong hồ sơ bạn${own}, mốc ${guide.experienceLabel}`;
  }
  return `Hồ sơ chưa đọc được số năm kinh nghiệm, nên tạm lấy mốc tin yêu cầu: ${guide.experienceLabel}`;
}

export function SalaryGuidePanel({ guide }: { guide: SalaryGuide | null }) {
  if (!guide) return null;

  return (
    <SectionCard
      compact
      icon={Coins}
      title="Mức lương nên đề xuất"
      description="Tính từ bảng lương tham chiếu, yêu cầu của tin và mức độ khớp hồ sơ"
    >
      <div className="flex gap-2">
        <Amount
          caption="Sàn"
          value={guide.floor}
          hint="dưới mức này nên cân nhắc từ chối"
        />
        <Amount
          caption="Nên đề xuất"
          value={guide.target}
          hint="con số nêu ra khi được hỏi"
          strong
        />
        <Amount
          caption="Trần"
          value={guide.ceiling}
          hint="mức cao nhất còn hợp lý"
        />
      </div>

      <ul className="mt-3 space-y-1 text-xs text-slate-500">
        <li>{basisLine(guide)}</li>
        <li>{experienceLine(guide)}</li>
        {guide.anchoredOnCurrentSalary && (
          <li>Sàn được nâng theo mức lương hiện tại bạn khai trong hồ sơ</li>
        )}
        {guide.cappedByPosting && (
          <li>Trần bị giới hạn bởi mức lương tin tuyển dụng công bố</li>
        )}
      </ul>

      {guide.experienceGap && guide.requiredYears !== null && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Tin này yêu cầu từ {years(guide.requiredYears)}, hồ sơ bạn đang có
          {guide.candidateYears !== null ? ` ${years(guide.candidateYears)}` : " ít hơn"}.
          Mức trên tính theo kinh nghiệm thật của bạn — đòi theo mặt bằng của tin
          là tự loại mình ở vòng lọc.
        </p>
      )}

      {guide.expectedSalary !== null &&
        (guide.expectedAboveCeiling || guide.expectedBelowFloor) && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Bạn mong {formatMonthlyVnd(guide.expectedSalary)}
            {guide.expectedAboveCeiling
              ? " — cao hơn trần hợp lý ở mốc kinh nghiệm này. Nêu con số đó thì phải có lý do rất cụ thể."
              : " — thấp hơn sàn của mốc kinh nghiệm này, bạn có thể đề xuất cao hơn."}
          </p>
        )}

      {guide.positionSlug && (
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-2xs text-slate-400">
          <Link
            href={`/salary/${guide.positionSlug}`}
            className="underline hover:text-slate-600"
          >
            Xem bảng lương vị trí này
          </Link>
        </p>
      )}
    </SectionCard>
  );
}
