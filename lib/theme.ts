export const THEMES = [
  { id: "light", label: "Sáng" },
  { id: "dark", label: "Tối" },
  { id: "system", label: "Tự động" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "system";
export const THEME_KEY = "aijob:theme";

/** Giá trị có phải một id giao diện hợp lệ hay không. */
export const isThemeId = (value: unknown): value is ThemeId =>
  THEMES.some((theme) => theme.id === value);

/** Đọc giao diện đã lưu trong localStorage. */
export function readTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return isThemeId(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

const listeners = new Set<() => void>();

/** Đăng ký lắng nghe thay đổi giao diện, trả về hàm huỷ đăng ký. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Quy `system` về sáng hoặc tối theo cài đặt của hệ điều hành. */
export function resolveTheme(id: ThemeId): "light" | "dark" {
  if (id !== "system") return id;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Gắn class và color-scheme của giao diện lên thẻ html. */
export function paintTheme(id: ThemeId): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolveTheme(id) === "dark");
  root.style.colorScheme = resolveTheme(id);
}

/** Áp dụng giao diện, lưu lại và báo cho người nghe. */
export function applyTheme(id: ThemeId): void {
  paintTheme(id);
  try {
    window.localStorage.setItem(THEME_KEY, id);
  } catch {}
  for (const listener of listeners) listener();
}

/** Ảnh chụp cho `useSyncExternalStore`; trên máy chủ luôn là mặc định. */
export const serverTheme = (): ThemeId => DEFAULT_THEME;

export const THEME_BOOTSTRAP = `
(function(){
  try {
    var saved = localStorage.getItem(${JSON.stringify(THEME_KEY)}) || 'system';
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var paint = function(){
      var dark = saved === 'dark' || (saved === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    paint();
    mq.addEventListener('change', function(){
      if ((localStorage.getItem(${JSON.stringify(THEME_KEY)}) || 'system') === 'system') paint();
    });
  } catch (e) {}
})();
`;
