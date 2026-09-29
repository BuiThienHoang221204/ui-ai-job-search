import {
  Briefcase,
  ChatText,
  ClockCounterClockwise,
  CurrencyCircleDollar,
  Envelope,
  FileText,
  Gear,
  GraduationCap,
  Question,
  Sparkle,
  SquaresFour,
  Stack,
  User,
} from "@phosphor-icons/react/ssr";

export const navItems = [
  { label: "Tổng quan", href: "/dashboard", icon: SquaresFour, exact: true },
  { label: "Hồ sơ của tôi", href: "/dashboard/profile", icon: User },
  { label: "Việc làm phù hợp", href: "/dashboard/jobs?scored=1", icon: Briefcase },
  { label: "Tất cả việc làm", href: "/dashboard/jobs", icon: Stack },
  { label: "Đã chấm bằng AI", href: "/dashboard/matches", icon: Sparkle },
  { label: "Tra cứu lương", href: "/dashboard/salary", icon: CurrencyCircleDollar },
  { label: "CV đã tạo", href: "/dashboard/cv-optimizer", icon: FileText },
  { label: "Thư đã viết", href: "/dashboard/cover-letter", icon: Envelope },
  { label: "Lịch sử ứng tuyển", href: "/dashboard/applications", icon: ClockCounterClockwise },
  { label: "Chuẩn bị phỏng vấn", href: "/dashboard/interview", icon: ChatText },
  { label: "Ngân hàng câu hỏi", href: "/dashboard/interview/questions", icon: Question },
  { label: "Lộ trình học", href: "/dashboard/upskill", icon: GraduationCap },
  { label: "Tài khoản", href: "/dashboard/settings", icon: Gear },
];

/** Lấy tiêu đề trang từ mục điều hướng khớp với đường dẫn hiện tại. */
export function pageTitle(pathname: string): string {
  const matched = navItems
    .filter((item) => !item.href.includes("?"))
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return matched?.label ?? "";
}
