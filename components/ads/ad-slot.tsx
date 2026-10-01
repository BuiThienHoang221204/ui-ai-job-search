"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react/ssr";
import { cn } from "@/utils";

const BANNER_SRC: Record<"300x250" | "728x90", string | null> = {
  "300x250": "https://bauval.org/22/60aacb930c6729e804806d6db74e6f5c",
  "728x90": "https://bauval.org/22/8f081c5f58fd8255f6a81079656d34fb",
};

const NATIVE_SRC: string | null = "https://bauval.org/21/d7963d5bfeb88dec2954b557fd490eca";

type BannerSize = keyof typeof BANNER_SRC;

type AdAlign = "start" | "center" | "end";

const ALIGN_CLASS: Record<AdAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const SCRIPT_TIMEOUT_MS = 8000;

let bannerQueue: Promise<void> = Promise.resolve();

/** Xếp hàng nạp banner: script đọc rồi xoá `atOptions` toàn cục nên mỗi lần chỉ được nạp một banner. */
function enqueueBanner(task: () => Promise<void>) {
  bannerQueue = bannerQueue.then(task, task);
}

/** Lấy mã định danh ở cuối URL script quảng cáo. */
const lastSegment = (src: string | null) => src?.split("/").pop() ?? null;

/** Khung chung cho mọi ô quảng cáo: nhãn "Quảng cáo" góc trái trên, nút tắt chỉ ẩn ô này tới khi rời trang. */
function AdFrame({
  className,
  align = "start",
  children,
}: {
  className?: string;
  align?: AdAlign;
  children: React.ReactNode;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className={cn("flex", ALIGN_CLASS[align], className)}>
      <div className="flex max-w-full flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-wide text-slate-400 uppercase">Quảng cáo</span>
          <button
            type="button"
            aria-label="Tắt quảng cáo"
            onClick={() => setClosed(true)}
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

/** Banner kích thước cố định, nạp lần lượt qua hàng đợi để nhiều banner cùng trang không giẫm `atOptions` của nhau. */
export function BannerAd({
  size,
  align,
  className,
}: {
  size: BannerSize;
  align?: AdAlign;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const src = BANNER_SRC[size];
  const key = lastSegment(src);
  const [width, height] = size.split("x").map(Number);

  useEffect(() => {
    const root = host.current;
    if (!root || !src || !key) return;
    let cancelled = false;
    enqueueBanner(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled || !root.isConnected) return resolve();
          const options = document.createElement("script");
          options.text = `atOptions=${JSON.stringify({ key, format: "iframe", height, width, params: {} })};`;
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          setTimeout(resolve, SCRIPT_TIMEOUT_MS);
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
    <AdFrame className={className} align={align}>
      <div ref={host} className="max-w-full overflow-hidden" style={{ width, height }} />
    </AdFrame>
  );
}

/** Banner 728x90 khi khung đủ rộng, tự đổi sang 300x250 khi khung hẹp hơn. */
export function ResponsiveBannerAd({ align, className }: { align?: AdAlign; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWide(entry.contentRect.width >= 728);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={cn("w-full", className)}>
      {wide !== null && (
        <BannerAd key={wide ? "wide" : "box"} size={wide ? "728x90" : "300x250"} align={align} />
      )}
    </div>
  );
}

const RAIL_QUERY = "(min-width: 1280px)";

/** Cột phải gồm hai banner 300x250 cùng dính lại khi cuộn; chỉ nạp khi màn hình đủ rộng. */
export function StickyRailAd({ className }: { className?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(RAIL_QUERY);
    const sync = () => setShow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!show) return null;

  return (
    <div className={cn("sticky top-6 flex flex-col gap-6", className)}>
      <BannerAd size="300x250" />
      <BannerAd size="300x250" />
    </div>
  );
}

/** Native banner hoà vào nội dung, nạp script trực tiếp vào trang vì nó tự dựng khối theo container. */
export function NativeAd({ align, className }: { align?: AdAlign; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const containerId = lastSegment(NATIVE_SRC);

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
    <AdFrame className={className} align={align}>
      <div ref={host} className="w-full" />
    </AdFrame>
  );
}
