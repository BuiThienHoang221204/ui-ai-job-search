import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChartBar } from "@phosphor-icons/react/ssr";
import { PageHeader } from "@/components/ui/page-header";
import { marketService } from "@/services";
import { formatCount } from "@/lib/number";

const ICONS: Record<string, string> = {
  "cong-nghe-thong-tin": "it",
  "marketing-pr-quang-cao": "marketing",
  "giao-duc-dao-tao": "education",
  "lao-dong-pho-thong": "manual",
  "ke-toan-kiem-toan-tai-chinh": "finance",
  "kinh-doanh-ban-hang": "sales",
  "san-xuat-co-khi-dien": "manufacturing",
  "logistics-xuat-nhap-khau": "logistics",
  "thiet-ke-sang-tao": "design",
  "du-lieu-ai": "data-ai",
  "cham-soc-khach-hang": "customer",
  "xay-dung-kien-truc": "construction",
  "nhan-su-hanh-chinh-phap-che": "hr",
  "ban-le-thuong-mai-dien-tu": "retail",
  "nha-hang-khach-san-du-lich": "hospitality",
  "y-te-duoc": "healthcare",
};

export const metadata: Metadata = {
  title: "Thị trường việc làm 30 ngày qua theo ngành — Careelot",
  description:
    "Số tin tuyển dụng, kỹ năng được yêu cầu nhiều nhất và lương trung vị theo từng ngành, cập nhật mỗi ngày từ tin tuyển dụng công khai.",
  robots: { index: true, follow: true },
};

/** Danh sách ngành có báo cáo thị trường; khách xem được. */
export default async function MarketIndexPage() {
  const occupations = await marketService.occupations();

  return (
    <>
      <PageHeader
        title="Thị trường việc làm"
        subtitle="30 ngày gần nhất, tổng hợp từ tin tuyển dụng công khai trên 10 trang việc làm"
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {occupations.map((occupation) => (
          <li key={occupation.slug}>
            <Link
              href={`/dashboard/market/${occupation.slug}`}
              className="hover:border-primary-200 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors"
            >
              {ICONS[occupation.slug] ? (
                <Image
                  src={`/icons/market/${ICONS[occupation.slug]}.webp`}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 shrink-0"
                />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center">
                  <ChartBar className="text-primary-600 size-7" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {occupation.name}
                </span>
                <span className="text-xs text-slate-500">
                  {formatCount(occupation.total)} tin trong 30 ngày
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
