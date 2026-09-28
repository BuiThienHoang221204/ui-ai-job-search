export const BASE_PX = 16;
export const MIN_PERCENT = 90;
export const MAX_PERCENT = 150;
export const STEP_PERCENT = 10;
export const DEFAULT_PERCENT = 100;

export const FONT_SCALE_KEY = "aijob:font-scale";

/** Làm tròn tỉ lệ cỡ chữ về bội số 10 và kẹp trong khoảng cho phép. */
export const clampPercent = (value: number): number =>
  Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, Math.round(value / 10) * 10));

/** Đọc tỉ lệ cỡ chữ đã lưu trong localStorage. */
export function readFontScale(): number {
  if (typeof window === "undefined") return DEFAULT_PERCENT;
  try {
    const saved = Number(window.localStorage.getItem(FONT_SCALE_KEY));
    return Number.isFinite(saved) && saved > 0
      ? clampPercent(saved)
      : DEFAULT_PERCENT;
  } catch {
    return DEFAULT_PERCENT;
  }
}

const listeners = new Set<() => void>();

/** Đăng ký lắng nghe thay đổi cỡ chữ, trả về hàm huỷ đăng ký. */
export function subscribeFontScale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Áp dụng tỉ lệ cỡ chữ lên trang, lưu lại và báo cho người nghe. */
export function applyFontScale(percent: number): void {
  if (typeof document === "undefined") return;
  const safe = clampPercent(percent);
  document.documentElement.style.fontSize = `${(BASE_PX * safe) / 100}px`;
  try {
    window.localStorage.setItem(FONT_SCALE_KEY, String(safe));
  } catch {}
  for (const listener of listeners) listener();
}

/** Ảnh chụp cho `useSyncExternalStore`; trên máy chủ luôn là mặc định. */
export const serverFontScale = (): number => DEFAULT_PERCENT;

export const FONT_SCALE_BOOTSTRAP = `
(function(){
  try {
    var raw = Number(localStorage.getItem(${JSON.stringify(FONT_SCALE_KEY)}));
    if (!raw) return;
    var pct = Math.min(${MAX_PERCENT}, Math.max(${MIN_PERCENT}, Math.round(raw / 10) * 10));
    document.documentElement.style.fontSize = (${BASE_PX} * pct / 100) + 'px';
  } catch (e) {}
})();
`;
