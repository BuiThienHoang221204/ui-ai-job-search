"use client";

import { Suspense, useState } from "react";
import { X } from "@phosphor-icons/react/ssr";
import { Header } from "@/components/layout/header";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

/** Khung dashboard: sidebar cố định trên desktop, drawer trên mobile, header và nội dung. */
export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div data-app-shell className="flex h-screen overflow-hidden bg-surface">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slab/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex">
            {sidebar}
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-3 ml-3 grid size-10 cursor-pointer place-items-center self-start rounded-lg bg-white/10 text-white"
              aria-label="Đóng menu"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="sidebar-offset flex h-screen min-w-0 flex-1 flex-col">
        <Suspense>
          <Header onMenuClick={() => setMobileOpen(true)} />
        </Suspense>
        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
