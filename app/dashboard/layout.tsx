import { Suspense } from "react";
import { AppLayout } from "@/components/dashboard/app-layout";
import { SessionProvider } from "@/components/dashboard/session";
import { Sidebar } from "@/components/dashboard/sidebar";

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
