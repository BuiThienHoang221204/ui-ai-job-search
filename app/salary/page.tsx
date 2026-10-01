import type { Metadata } from "next";
import { SalaryList, salaryPositionCount } from "@/components/salary/salary-list";
import { ResponsiveBannerAd } from "@/components/ads/ad-slot";

export const metadata: Metadata = {
  title: "Tra cứu mức lương theo vị trí và ngành nghề",
  description:
    "Tra cứu khoảng lương phổ biến và mức lương trung bình theo từng vị trí công việc, phân tách theo số năm kinh nghiệm.",
};

/** Trang công khai tra cứu lương (ngoài /dashboard để Google đọc được). */
export default async function SalaryPage() {
  const count = await salaryPositionCount();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Tra cứu mức lương
        </h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Khoảng lương phổ biến của {count} vị trí công việc, phân tách theo số năm
          kinh nghiệm.
        </p>
      </header>

      <ResponsiveBannerAd className="mb-8" />

      <SalaryList basePath="/salary" />
    </main>
  );
}
