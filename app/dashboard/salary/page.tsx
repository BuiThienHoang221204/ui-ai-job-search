import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import {
  SalaryList,
  salaryPositionCount,
} from "@/components/salary/salary-list";

export const metadata: Metadata = {
  title: "Tra cứu lương theo vị trí — Careelot",
  description:
    "Khoảng lương phổ biến của từng vị trí tại Việt Nam, tách theo số năm kinh nghiệm: dưới 1 năm, 1–3 năm, 3–5 năm, trên 5 năm.",
  robots: { index: true, follow: true },
};

/** Trang tra cứu mức lương; khách xem được, Google index được. */
export default async function DashboardSalaryPage() {
  const count = await salaryPositionCount();

  return (
    <>
      <PageHeader
        title="Tra cứu lương"
        subtitle={`Khoảng lương phổ biến của ${count} vị trí, phân tách theo số năm kinh nghiệm`}
      />
      <SalaryList basePath="/dashboard/salary" />
    </>
  );
}
