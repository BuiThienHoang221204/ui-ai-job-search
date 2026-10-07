"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { X } from "@phosphor-icons/react/ssr";
import { cn } from "@/utils";

// Tạm tắt quảng cáo tới khi Adsterra chặn xong nhóm cờ bạc/cho vay; bật lại bằng cách thay null bằng link đang comment.
const BANNER_SRC = {
  // "300x250": "https://bauval.org/22/60aacb930c6729e804806d6db74e6f5c",
  "300x250": null as string | null,
  // "728x90": "https://bauval.org/22/8f081c5f58fd8255f6a81079656d34fb",
  "728x90": null as string | null,
};

// const NATIVE_SRC: string | null = "https://bauval.org/21/d7963d5bfeb88dec2954b557fd490eca";
const NATIVE_SRC: string | null = null;

export type BannerSize = keyof typeof BANNER_SRC;
export type AdAlign = "start" | "center" | "end";

export const RAIL_AD_AVAILABLE = Boolean(BANNER_SRC["300x250"]);

let bannerQueue: Promise<void> = Promise.resolve();

/** Khung chung cho mọi ô quảng cáo: nhãn "Quảng cáo" và nút đóng */
function AdFrame({
  className,
  align = "start",
  onClose,
  children,
}: {
  className?: string;
  align?: AdAlign;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      className={cn(
        "flex",
        align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start",
        className,
      )}
    >
      <div className="flex max-w-full flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-wide text-slate-400 uppercase">Quảng cáo</span>
          <button
            type="button"
            aria-label="Tắt quảng cáo"
            onClick={() => {
              setClosed(true);
              onClose?.();
            }}
            className="flex size-4 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="size-2.5" weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Banner kích thước cố định (300x250 hoặc 728x90), nạp tuần tự qua Promise queue để tránh xung đột `atOptions` */
export function BannerAd({
  size,
  align,
  className,
  onClose,
}: {
  size: BannerSize;
  align?: AdAlign;
  className?: string;
  onClose?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const src = BANNER_SRC[size];
  const key = src?.split("/").pop();
  const [width, height] = size.split("x").map(Number);

  useEffect(() => {
    const root = host.current;
    if (!root || !src || !key) return;
    let cancelled = false;

    bannerQueue = bannerQueue.then(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled || !root.isConnected) return resolve();
          const options = document.createElement("script");
          options.text = `atOptions=${JSON.stringify({ key, format: "iframe", height, width, params: {} })};`;
          const script = document.createElement("script");
          script.src = src;
          script.onload = script.onerror = () => resolve();
          setTimeout(resolve, 8000);
          root.append(options, script);
        }),
    );

    return () => {
      cancelled = true;
      root.replaceChildren();
    };
  }, [src, key, width, height]);

  if (!src || !key) return null;

  return (
    <AdFrame className={className} align={align} onClose={onClose}>
      <div ref={host} className="max-w-full overflow-hidden" style={{ width, height }} />
    </AdFrame>
  );
}

/** Banner 728x90 khi khung đủ rộng, tự chuyển sang 300x250 khi khung hẹp */
export function ResponsiveBannerAd({ align, className }: { align?: AdAlign; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState<boolean | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= 728));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasAny = Boolean(BANNER_SRC["728x90"] || BANNER_SRC["300x250"]);
  if (closed || !hasAny) return null;

  const size: BannerSize = wide ? "728x90" : "300x250";
  if (wide !== null && !BANNER_SRC[size]) return null;

  return (
    <div ref={box} className={cn("w-full", className)}>
      {wide !== null && (
        <BannerAd key={size} size={size} align={align} onClose={() => setClosed(true)} />
      )}
    </div>
  );
}

/** Cột phải gồm 2 banner 300x250 dính lại khi cuộn màn hình rộng >= 1280px */
export function StickyRailAd({ className, onEmpty }: { className?: string; onEmpty?: () => void }) {
  const isDesktop = useSyncExternalStore(
    (cb) => {
      const media = window.matchMedia("(min-width: 1280px)");
      media.addEventListener("change", cb);
      return () => media.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false,
  );
  const [closedCount, setClosedCount] = useState(0);

  const closeOne = () => {
    const next = closedCount + 1;
    setClosedCount(next);
    if (next >= 2) onEmpty?.();
  };

  if (!RAIL_AD_AVAILABLE || !isDesktop || closedCount >= 2) return null;

  return (
    <div className={cn("sticky top-6 flex flex-col gap-6", className)}>
      <BannerAd size="300x250" onClose={closeOne} />
      <BannerAd size="300x250" onClose={closeOne} />
    </div>
  );
}

/** Native banner hoà vào nội dung */
export function NativeAd({
  align,
  className,
  onClose,
}: {
  align?: AdAlign;
  className?: string;
  onClose?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const containerId = NATIVE_SRC?.split("/").pop();

  useEffect(() => {
    const root = host.current;
    if (!root || !NATIVE_SRC || !containerId) return;
    const container = document.createElement("div");
    container.id = `container-${containerId}`;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = NATIVE_SRC;
    root.append(script, container);
    return () => root.replaceChildren();
  }, [containerId]);

  if (!NATIVE_SRC || !containerId) return null;

  return (
    <AdFrame className={className} align={align} onClose={onClose}>
      <div ref={host} className="w-full" />
    </AdFrame>
  );
}
