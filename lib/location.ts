export const LOCATION_UNKNOWN = "Không rõ";

const MAX_CHARS = 28;

export interface DisplayLocation {
  text: string;
  full?: string;
}

/** Rút gọn địa điểm tin tuyển dụng để hiện trong ô bảng, giữ nguyên văn cho `title`. */
export function displayLocation(location?: string | null): DisplayLocation {
  const trimmed = location?.trim();
  if (!trimmed) return { text: LOCATION_UNKNOWN };
  if (trimmed.length <= MAX_CHARS) return { text: trimmed };

  const cut = trimmed.slice(0, MAX_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > MAX_CHARS - 16 ? cut.slice(0, lastSpace) : cut;

  return { text: `${head.replace(/[,;\s]+$/, "")}…`, full: trimmed };
}
