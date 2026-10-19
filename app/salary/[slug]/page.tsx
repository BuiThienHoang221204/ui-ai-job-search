import { redirect } from "next/navigation";

type Params = { params: Promise<{ slug: string }> };

/** Đường cũ của trang lương một vị trí; nay chỉ xem sau khi đăng nhập. */
export default async function SalaryPositionPage({ params }: Params) {
  const { slug } = await params;
  redirect(`/dashboard/salary/${encodeURIComponent(slug)}`);
}
