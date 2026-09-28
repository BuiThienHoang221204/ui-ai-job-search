"use client";

import { useState, type HTMLAttributes } from "react";
import { cn } from "@/utils";

interface CompanyLogoProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  color: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-11 text-sm",
  md: "size-13 text-base",
  lg: "size-16 text-lg",
};

const IMAGE_PADDING = "p-1";

/** Logo công ty: ưu tiên ảnh thật, lùi về ô chữ cái đầu khi không có ảnh hoặc ảnh tải hỏng. */
export function CompanyLogo({
  initials,
  color,
  src,
  size = "md",
  className,
  ...props
}: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold text-white",
        src && !failed
          ? `border border-slate-200 bg-white ${IMAGE_PADDING}`
          : color,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      ) : (
        initials
      )}
    </div>
  );
}
