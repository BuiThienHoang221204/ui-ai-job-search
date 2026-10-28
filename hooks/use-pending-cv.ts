"use client";

import { create } from "zustand";

interface PendingCvState {
  file: File | null;
  hold: (file: File) => void;
  take: () => File | null;
}

/** CV khách vừa chấm, giữ trong bộ nhớ trang để sau khi đăng nhập trang đọc CV dùng luôn, không phải chọn lại file. */
export const usePendingCv = create<PendingCvState>((set, get) => ({
  file: null,
  hold: (file) => set({ file }),
  take: () => {
    const { file } = get();
    set({ file: null });
    return file;
  },
}));
