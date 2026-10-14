"use client";

import { useEffect, useState } from "react";

type Attach = (element: HTMLElement | null) => void;

/** Cột phụ cuộn TỈ LỆ theo khung chứa: khung đi được p% quãng cuộn thì cột phụ đi p% phần cao hơn màn hình, nên hai cột chạm đáy cùng lúc. Ghi thẳng `style.top` để trang không render lại mỗi lần cuộn. */
export function useSyncedSticky(gap = 24): [Attach, Attach] {
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!panel || !container) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const overflow = Math.max(0, panel.offsetHeight - (viewport - 2 * gap));
      const box = container.getBoundingClientRect();
      const range = box.height - viewport + 2 * gap;
      const progress =
        range > 0 ? Math.min(1, Math.max(0, (gap - box.top) / range)) : 0;
      panel.style.setProperty("top", `${gap - progress * overflow}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    const observer = new ResizeObserver(schedule);
    observer.observe(panel);
    observer.observe(container);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [panel, container, gap]);

  return [setPanel, setContainer];
}
