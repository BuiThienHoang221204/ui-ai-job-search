"use client";

import { useEffect } from "react";

/** Đăng ký service worker, chỉ ở bản build để không làm hỏng hot reload khi dev. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
    });
  }, []);
  return null;
}
