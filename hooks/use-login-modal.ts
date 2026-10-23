import { create } from "zustand";

type LoginMode = "login" | "register";

interface LoginModalOptions {
  reason?: string;
  next?: string;
  mode?: LoginMode;
}

interface LoginModalState {
  isOpen: boolean;
  reason: string | null;
  next: string | null;
  mode: LoginMode;
  open: (options?: LoginModalOptions) => void;
  setMode: (mode: LoginMode) => void;
  close: () => void;
}

/** Modal đăng nhập cho khách: mở ngay trên trang đang xem thay vì chuyển sang /login. */
export const useLoginModal = create<LoginModalState>((set) => ({
  isOpen: false,
  reason: null,
  next: null,
  mode: "login",
  open: (options = {}) =>
    set({
      isOpen: true,
      reason: options.reason ?? null,
      next: options.next ?? null,
      mode: options.mode ?? "login",
    }),
  setMode: (mode) => set({ mode }),
  close: () => set({ isOpen: false }),
}));
