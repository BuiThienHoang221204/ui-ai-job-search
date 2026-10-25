import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, Code, MapPin, Stairs } from "@phosphor-icons/react/ssr";
import { marketService } from "@/services";
import { formatDate } from "@/lib/date";
import { formatCount } from "@/lib/number";
import { formatMonthlyVnd } from "@/lib/salary";
import { PageHeader } from "@/components/ui/page-header";
import { MarketCta } from "./market-cta";
import { ShareBars } from "./share-bars";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const report = await marketService.report(slug);
  if (!report) return { title: "Không tìm thấy báo cáo — Careelot" };
  return {
    title: `Thị trường việc làm ${report.name} 30 ngày qua — Careelot`,
    description: `${formatCount(report.total)} tin tuyển dụng ${report.name} trong 30 ngày: kỹ năng được yêu cầu nhiều nhất, lương trung vị theo nghề và tỉnh.`,
    robots: { index: true, follow: true },
  };
}

/** Báo cáo thị trường 30 ngày của một ngành; khách xem được, Google index được. */
export default async function MarketReportPage({ params }: Params) {
  const { slug } = await params;
  const report = await marketService.report(slug);
  if (!report) notFound();

  let medianSalary = "Chưa đủ dữ liệu";
  if (report.salary.median !== null)
    medianSalary = formatMonthlyVnd(report.salary.median);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Thị trường việc làm ${report.name}`}
        subtitle={`30 ngày gần nhất (${formatDate(report.from)} – ${formatDate(report.to)}) · từ ${formatCount(report.total)} tin tuyển dụng trên 10 trang việc làm`}
        actions={
          <Link
            href="/dashboard/market"
            className="text-primary-700 hover:text-primary-800 text-sm font-semibold"
          >
            Ngành khác →
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tin tuyển dụng</p>
          <p className="font-display text-2xl font-semibold text-slate-900">
            {formatCount(report.total)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Lương trung vị / tháng</p>
          <p className="font-display text-2xl font-semibold text-slate-900">
            {medianSalary}
          </p>
          <p className="text-xs text-slate-500">
            từ {report.salary.withSalaryPercent}% tin có ghi mức lương
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Công ty đang tuyển</p>
          <p className="font-display text-2xl font-semibold text-slate-900">
            {formatCount(report.companies)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Code className="text-primary-600 size-5" />
            Kỹ năng được yêu cầu nhiều nhất
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            % trên {formatCount(report.skills.analysed)} tin đã đọc yêu cầu
          </p>
          <ShareBars rows={report.skills.top} />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Briefcase className="text-primary-600 size-5" />
            Nghề tuyển nhiều nhất
          </h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="pb-1 font-medium">Nghề</th>
                <th className="pb-1 font-medium">Tin</th>
                <th className="pb-1 font-medium">Lương trung vị</th>
              </tr>
            </thead>
            <tbody>
              {report.subOccupations.map((row) => (
                <tr key={row.name} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-800">{row.name}</td>
                  <td className="py-1.5 text-slate-600 tabular-nums">
                    {formatCount(row.count)}
                  </td>
                  <td className="py-1.5 text-slate-600">
                    {row.medianSalary === null
                      ? "—"
                      : formatMonthlyVnd(row.medianSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <MapPin className="text-primary-600 size-5" />
            Theo tỉnh
          </h2>
          <ShareBars rows={report.provinces} />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <Stairs className="text-primary-600 size-5" />
            Theo cấp bậc
          </h2>
          <ShareBars
            rows={report.seniority.map((row) => ({
              name: row.label,
              percent: row.percent,
            }))}
          />
        </section>
      </div>

      <MarketCta />
      <p className="text-xs text-slate-400">
        Số liệu tổng hợp từ tin tuyển dụng công khai, không phải thống kê chính
        thức.
      </p>
    </div>
  );
}
