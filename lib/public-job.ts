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

const GUEST_PATH = /^\/dashboard\/(jobs|salary)(\/[^/]+)?$/;

export function portalName(source: string): string {
  return PORTAL_NAMES[source] ?? source;
}

/** Trang khách chưa đăng nhập xem được: việc làm (danh sách, chi tiết một tin) và tra cứu lương. */
export function isGuestPath(pathname: string): boolean {
  return GUEST_PATH.test(pathname);
}

/** Trang đăng nhập, xong thì quay về đúng tin đang xem. */
export function loginPathForJob(jobId: string): string {
  return `/login?next=${encodeURIComponent(`/dashboard/jobs/${jobId}`)}`;
}
