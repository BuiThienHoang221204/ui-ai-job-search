import { Suspense } from "react";
import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { SessionProvider } from "@/providers/session-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { LoginModal } from "@/components/auth/login-modal";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Layout chung của khu vực dashboard. */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <AppLayout
        sidebar={
          <Suspense>
            <Sidebar />
          </Suspense>
        }
      >
        {children}
      </AppLayout>
      <LoginModal />
    </SessionProvider>
  );
}
