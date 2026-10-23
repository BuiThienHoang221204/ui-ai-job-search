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

const GUEST_PATH = /^\/dashboard\/jobs(\/[^/]+)?$/;

export function portalName(source: string): string {
  return PORTAL_NAMES[source] ?? source;
}

/** Trang khách chưa đăng nhập xem được: việc làm (danh sách, chi tiết một tin). */
export function isGuestPath(pathname: string): boolean {
  return GUEST_PATH.test(pathname);
}
