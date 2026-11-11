"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { List } from "@phosphor-icons/react/ssr";
import { pageTitle } from "@/components/layout/nav-items";
import { useSession } from "@/hooks/use-session";

interface HeaderProps {
  onMenuClick: () => void;
}

/** Thanh đầu trang chỉ trên mobile: nút mở menu và tiêu đề trang. Desktop không có header để nội dung rộng chỗ. */
export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSession();
  const pathname = usePathname();
  const query = useSearchParams().toString();

  const title =
    !user && pathname === "/dashboard" ? "Trang chủ" : pageTitle(pathname, query);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
        aria-label="Mở menu"
      >
        <List className="size-5.5" />
      </button>
      {title && (
        <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      )}
    </header>
  );
}
