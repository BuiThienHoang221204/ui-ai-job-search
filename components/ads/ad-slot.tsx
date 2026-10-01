"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/utils";

const BANNER_SRC: Record<"300x250" | "728x90", string | null> = {
  "300x250": "https://bauval.org/22/60aacb930c6729e804806d6db74e6f5c",
  "728x90": null,
};

const NATIVE_SRC: string | null = "https://bauval.org/21/d7963d5bfeb88dec2954b557fd490eca";

type BannerSize = keyof typeof BANNER_SRC;

/** Lấy mã định danh ở cuối URL script quảng cáo. */
const lastSegment = (src: string | null) => src?.split("/").pop() ?? null;

const DESKTOP_QUERY = "(min-width: 768px)";

/** Theo dõi màn hình có đủ rộng cho banner 728x90 hay không. */
function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(DESKTOP_QUERY);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/** Khung chung cho mọi ô quảng cáo, kèm nhãn "Quảng cáo". */
function AdFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span className="text-[10px] tracking-wide text-slate-400 uppercase">Quảng cáo</span>
      {children}
    </div>
  );
}

/** Banner kích thước cố định; mỗi trang chỉ đặt một banner vì script đọc biến toàn cục `atOptions`. */
export function BannerAd({ size, className }: { size: BannerSize; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const src = BANNER_SRC[size];
  const key = lastSegment(src);
  const [width, height] = size.split("x").map(Number);

  useEffect(() => {
    const root = host.current;
    if (!root || !src || !key) return;
    const options = document.createElement("script");
    options.text = `atOptions=${JSON.stringify({ key, format: "iframe", height, width, params: {} })};`;
    const script = document.createElement("script");
    script.src = src;
    root.append(options, script);
    return () => root.replaceChildren();
  }, [src, key, width, height]);

  if (!src || !key) return null;

  return (
    <AdFrame className={className}>
      <div ref={host} className="max-w-full overflow-hidden" style={{ width, height }} />
    </AdFrame>
  );
}

/** Banner 728x90 trên máy tính, tự đổi sang 300x250 trên điện thoại. */
export function ResponsiveBannerAd({ className }: { className?: string }) {
  const desktop = useIsDesktop() && BANNER_SRC["728x90"] !== null;
  return <BannerAd key={desktop ? "wide" : "box"} size={desktop ? "728x90" : "300x250"} className={className} />;
}

/** Native banner hoà vào nội dung, nạp script trực tiếp vào trang vì nó tự dựng khối theo container. */
export function NativeAd({ className }: { className?: string }) {
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
    <AdFrame className={className}>
      <div ref={host} className="w-full" />
    </AdFrame>
  );
}
