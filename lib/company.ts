const LOGO_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
] as const;

/** Chọn màu logo cố định theo tên công ty (băm tên, không ngẫu nhiên). */
export function companyColor(company: string): string {
  let hash = 0;
  for (let index = 0; index < company.length; index += 1) {
    hash = (hash * 31 + company.charCodeAt(index)) | 0;
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

/** Lấy tối đa hai chữ cái đầu, ví dụ "FPT Software" -> "FS". */
export function companyInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Lấy chữ cái đầu của hai từ cuối trong tên người, ví dụ "Nguyễn Văn Demo" -> "VD". */
export function personInitials(name: string | undefined | null): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
