"use client";

import { useEffect } from "react";

/** Chỉ chạy khi web được mở trong app Capacitor (native): nút back vật lý Android,
 * mở link ra domain khác bằng trình duyệt hệ thống thay vì kẹt trong WebView, và
 * style status bar theo giao diện máy. Trên web thường thì không làm gì. */
export function NativeShell() {
  useEffect(() => {
    let cleanup = () => {};

    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const [{ App: CapApp }, { StatusBar, Style }, { Browser }] =
        await Promise.all([
          import("@capacitor/app"),
          import("@capacitor/status-bar"),
          import("@capacitor/browser"),
        ]);

      void StatusBar.setStyle({ style: Style.Default }).catch(() => {});

      const backSub = await CapApp.addListener(
        "backButton",
        ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else void CapApp.exitApp();
        },
      );

      const onClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest("a");
        const href = anchor?.getAttribute("href");
        if (!href) return;
        let url: URL;
        try {
          url = new URL(href, window.location.href);
        } catch {
          return;
        }
        if (
          url.origin !== window.location.origin &&
          (url.protocol === "https:" || url.protocol === "http:")
        ) {
          event.preventDefault();
          void Browser.open({ url: url.href });
        }
      };
      document.addEventListener("click", onClick);

      cleanup = () => {
        void backSub.remove();
        document.removeEventListener("click", onClick);
      };
    })();

    return () => cleanup();
  }, []);

  return null;
}
