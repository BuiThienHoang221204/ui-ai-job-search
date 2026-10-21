"use client";

import { cn } from "@/lib/cn";

interface CompanyLogoProps {
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-11",
  md: "size-13",
  lg: "size-16",
};

const DEFAULT_LOGO = "/icons/no_company.png";

/** Logo công ty: hiển thị logo thật, nếu không có hoặc tải lỗi thì dùng no_company.png. */
export function CompanyLogo({ src, size = "md", className }: CompanyLogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1",
        sizeClasses[size],
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || DEFAULT_LOGO}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_LOGO;
        }}
        className="size-full object-contain"
      />
    </div>
  );
}
