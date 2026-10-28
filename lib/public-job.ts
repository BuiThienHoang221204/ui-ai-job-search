const PORTAL_NAMES: Record<string, string> = {
  topcv: "TopCV",
  itviec: "ITviec",
  vietnamworks: "VietnamWorks",
  linkedin: "LinkedIn",
  careerlink: "CareerLink",
  vieclam24h: "Vieclam24h",
  careerviet: "CareerViet",
  joboko: "JobOKO",
  topdev: "TopDev",
  "123job": "123job",
};

const GUEST_PATH =
  /^\/dashboard(\/((jobs|market|salary)(\/[^/]+)?|cv-check|chinh-sach-bao-mat|dieu-khoan-su-dung))?$/;

export function portalName(source: string): string {
  return PORTAL_NAMES[source] ?? source;
}

/** Trang khách chưa đăng nhập xem được: trang chào (`/dashboard`), việc làm (danh sách, chi tiết một tin), báo cáo thị trường, tra cứu lương, phân tích CV, Chính sách bảo mật và Điều khoản sử dụng. */
export function isGuestPath(pathname: string): boolean {
  return GUEST_PATH.test(pathname);
}

/** Link chia sẻ một tin: mở thẳng tin đó trong danh sách việc làm, kèm mã giới thiệu khi người chia sẻ đã đăng nhập. */
export function jobShareUrl(
  origin: string,
  jobId: string,
  referralCode?: string,
): string {
  const query = new URLSearchParams({ job: jobId });
  if (referralCode) query.set("ref", referralCode);
  return `${origin}/dashboard/jobs?${query.toString()}`;
}
