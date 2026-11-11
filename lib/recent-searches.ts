import { fold } from "@/lib/text";

const STORAGE_KEY = "careelot:recent-searches";
const MAX_RECENT = 5;

/** Đưa từ khoá lên đầu danh sách tìm gần đây, bỏ bản trùng (so không dấu) và giữ tối đa 5 mục. */
export function addRecent(list: string[], query: string): string[] {
  const term = query.trim();
  if (!term) return list;
  const rest = list.filter((item) => fold(item) !== fold(term));
  return [term, ...rest].slice(0, MAX_RECENT);
}

/** Đọc danh sách tìm gần đây của trình duyệt; storage hỏng hoặc bị chặn thì coi như rỗng. */
export function readRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/** Ghi lại danh sách tìm gần đây; lỗi storage thì bỏ qua vì đây chỉ là tiện ích. */
export function writeRecent(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    return;
  }
}
