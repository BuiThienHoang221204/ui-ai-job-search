import { Suspense } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { SessionProvider } from "@/providers/session-provider";
import { Sidebar } from "@/components/layout/sidebar";

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
    </SessionProvider>
  );
}
