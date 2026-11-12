"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const RESTORE_FRAMES = 30;
const SAVE_AFTER_IDLE_MS = 150;

/** Nhớ vị trí cuộn của khung `target` theo từng URL: back/forward cuộn lại đúng chỗ cũ, sang trang khác thì về đầu. Trình duyệt chỉ tự nhớ khi cả cửa sổ cuộn, còn dashboard cuộn trong `<main>`. */
export function useScrollMemory(target: RefObject<HTMLElement | null>): void {
  const pathname = usePathname();
  const key = `${pathname}?${useSearchParams().toString()}`;
  const positions = useRef(new Map<string, number>());
  const popped = useRef(false);
  const lastKey = useRef<string | null>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const markPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", markPop);
    return () => window.removeEventListener("popstate", markPop);
  }, []);

  useLayoutEffect(() => {
    const el = target.current;
    if (!el) return;
    let idle = 0;

    if (lastKey.current !== key) {
      const pathChanged = lastPath.current !== pathname;
      lastKey.current = key;
      lastPath.current = pathname;
      requestAnimationFrame(() => {
        const top = popped.current ? (positions.current.get(key) ?? 0) : null;
        popped.current = false;
        if (top === null) {
          if (pathChanged) el.scrollTo({ top: 0 });
          return;
        }
        let tries = 0;
        const restore = () => {
          el.scrollTo({ top });
          tries += 1;
          if (Math.abs(el.scrollTop - top) > 1 && tries < RESTORE_FRAMES) {
            requestAnimationFrame(restore);
          }
        };
        restore();
      });
    }

    const save = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => positions.current.set(key, el.scrollTop), SAVE_AFTER_IDLE_MS);
    };
    el.addEventListener("scroll", save, { passive: true });
    return () => {
      window.clearTimeout(idle);
      el.removeEventListener("scroll", save);
    };
  }, [key, pathname, target]);
}
