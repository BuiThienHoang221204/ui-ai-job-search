import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  SalaryDetail,
  loadSalaryPosition,
} from "@/components/salary/salary-detail";

type Params = { params: Promise<{ slug: string }> };

/** Sinh metadata cho trang lương của một vị trí. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadSalaryPosition((await params).slug);
  if (!data) return { title: "Không tìm thấy vị trí — Careelot" };
  return {
    title: `Mức lương ${data.positionName} — Careelot`,
    description: `Lương ${data.positionName} tại Việt Nam theo số năm kinh nghiệm, kèm so sánh với các vị trí cùng ngành${data.occupationName ? ` ${data.occupationName}` : ""}.`,
    robots: { index: true, follow: true },
  };
}

/** Trang mức lương của một vị trí; khách xem được, Google index được, không có vị trí thì 404. */
export default async function DashboardSalaryPositionPage({ params }: Params) {
  const { slug } = await params;
  const data = await loadSalaryPosition(slug);
  if (!data) notFound();

  return (
    <>
      <PageHeader
        title={`Mức lương ${data.positionName}`}
        subtitle={data.occupationName ?? undefined}
        actions={
          <Link href="/dashboard/salary">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" />
              Tra cứu lương
            </Button>
          </Link>
        }
      />
      <SalaryDetail slug={slug} basePath="/dashboard/salary" />
    </>
  );
}
