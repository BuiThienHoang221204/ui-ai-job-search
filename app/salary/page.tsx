import { redirect } from "next/navigation";

/** Đường cũ của trang tra cứu lương công khai; nay chỉ xem sau khi đăng nhập. */
export default function SalaryPage() {
  redirect("/dashboard/salary");
}
