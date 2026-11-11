export const LOCATION_UNKNOWN = "Không rõ";

const MAX_CHARS = 28;

export interface DisplayLocation {
  text: string;
  full?: string;
}

/** Rút gọn địa điểm tin tuyển dụng để hiện trong ô bảng, giữ nguyên văn cho `title`. Địa chỉ dài giữ các phần CUỐI (quận, tỉnh/thành) vì đó là phần người tìm việc cần; một phần cuối vẫn quá dài thì cắt ở ranh giới từ. */
export function displayLocation(location?: string | null): DisplayLocation {
  const trimmed = location?.trim();
  if (!trimmed) return { text: LOCATION_UNKNOWN };
  if (trimmed.length <= MAX_CHARS) return { text: trimmed };

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  let tail = "";
  for (let i = parts.length - 1; i >= 0; i--) {
    const next = tail ? `${parts[i]}, ${tail}` : parts[i];
    if (next.length > MAX_CHARS) break;
    tail = next;
  }
  if (tail) return { text: `…${tail}`, full: trimmed };

  const last = parts[parts.length - 1] ?? trimmed;
  const cut = last.slice(0, MAX_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > MAX_CHARS - 16 ? cut.slice(0, lastSpace) : cut;

  return { text: `${head.replace(/[,;\s]+$/, "")}…`, full: trimmed };
}
