export type SidebarState = "expanded" | "collapsed";

export const DEFAULT_SIDEBAR: SidebarState = "expanded";
export const SIDEBAR_KEY = "aijob:sidebar";

/** Giá trị có phải một trạng thái sidebar hợp lệ hay không. */
export const isSidebarState = (value: unknown): value is SidebarState =>
  value === "expanded" || value === "collapsed";

/** Đọc trạng thái sidebar đã lưu trong localStorage. */
export function savedSidebar(): SidebarState {
  try {
    const saved = window.localStorage.getItem(SIDEBAR_KEY);
    return isSidebarState(saved) ? saved : DEFAULT_SIDEBAR;
  } catch {
    return DEFAULT_SIDEBAR;
  }
}

/** Đọc trạng thái sidebar đang hiển thị, nếu chưa có thì lấy bản đã lưu. */
export function readSidebar(): SidebarState {
  if (typeof document === "undefined") return DEFAULT_SIDEBAR;
  const painted = document.documentElement.dataset.sidebar;
  if (isSidebarState(painted)) return painted;
  return savedSidebar();
}

const listeners = new Set<() => void>();

/** Đăng ký lắng nghe thay đổi sidebar, trả về hàm huỷ đăng ký. */
export function subscribeSidebar(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Gắn trạng thái sidebar lên thẻ html mà không lưu lại. */
export function paintSidebar(state: SidebarState): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.sidebar = state;
}

/** Áp dụng trạng thái sidebar, lưu lại và báo cho người nghe. */
export function applySidebar(state: SidebarState): void {
  paintSidebar(state);
  try {
    window.localStorage.setItem(SIDEBAR_KEY, state);
  } catch {}
  for (const listener of listeners) listener();
}

/** Đảo trạng thái thu gọn/mở rộng của sidebar. */
export function toggleSidebar(): void {
  applySidebar(readSidebar() === "collapsed" ? "expanded" : "collapsed");
}

export const SPLIT_ROOMY_WIDTH = 1440;

/** Tạm thu gọn sidebar khi màn hình hẹp, trả về hàm khôi phục. */
export function squeezeSidebar(): () => void {
  if (typeof window === "undefined") return () => {};

  const fit = () => {
    paintSidebar(
      window.innerWidth < SPLIT_ROOMY_WIDTH ? "collapsed" : savedSidebar(),
    );
    for (const listener of listeners) listener();
  };

  fit();
  window.addEventListener("resize", fit);

  return () => {
    window.removeEventListener("resize", fit);
    paintSidebar(savedSidebar());
    for (const listener of listeners) listener();
  };
}

/** Ảnh chụp cho `useSyncExternalStore`; trên máy chủ luôn là mặc định. */
export const serverSidebar = (): SidebarState => DEFAULT_SIDEBAR;

export const SIDEBAR_BOOTSTRAP = `
(function(){
  try {
    var saved = localStorage.getItem(${JSON.stringify(SIDEBAR_KEY)});
    document.documentElement.dataset.sidebar =
      (saved === 'collapsed' || saved === 'expanded') ? saved : 'expanded';
  } catch (e) {
    document.documentElement.dataset.sidebar = 'expanded';
  }
})();
`;
