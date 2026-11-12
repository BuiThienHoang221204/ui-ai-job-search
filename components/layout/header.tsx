"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, List } from "@phosphor-icons/react/ssr";
import { navMatch, pageTitle } from "@/components/layout/nav-items";
import { useSession } from "@/hooks/use-session";

interface HeaderProps {
  onMenuClick: () => void;
}

const DETAIL_PARAMS = ["doc", "jobId"];

const HEADER_BUTTON =
  "flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100";

/** Thanh đầu trang chỉ trên mobile: tiêu đề trang, nút mở menu, hoặc nút quay lại ở trang chi tiết (đường dẫn sâu hơn mục điều hướng, hoặc mở một tài liệu qua `?doc=`, `?jobId=`). Desktop không có header để nội dung rộng chỗ. */
export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const pagesSeen = useRef(0);

  useEffect(() => {
    pagesSeen.current += 1;
  }, [pathname, query]);

  const title =
    !user && pathname === "/dashboard" ? "Trang chủ" : pageTitle(pathname, query);
  const section = navMatch(pathname);
  let parent: string | null = null;
  if (section && section.href !== pathname) parent = section.href;
  else if (DETAIL_PARAMS.some((name) => params.has(name))) parent = pathname;

  const goBack = () => {
    if (pagesSeen.current > 1) router.back();
    else if (parent) router.push(parent);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
      {parent ? (
        <button type="button" onClick={goBack} className={HEADER_BUTTON} aria-label="Quay lại">
          <ArrowLeft className="size-5.5" />
        </button>
      ) : (
        <button type="button" onClick={onMenuClick} className={HEADER_BUTTON} aria-label="Mở menu">
          <List className="size-5.5" />
        </button>
      )}
      {title && (
        <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      )}
    </header>
  );
}
