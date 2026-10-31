import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { NativeShell } from "@/components/pwa/native-shell";
import { FONT_SCALE_BOOTSTRAP } from "@/lib/font-scale";
import { SIDEBAR_BOOTSTRAP } from "@/lib/sidebar";
import { THEME_BOOTSTRAP } from "@/lib/theme";
import "./globals.css";

const googleSans = Google_Sans_Flex({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  variable: "--font-google-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Careelot | Tìm việc làm bằng AI",
  description:
    "Dashboard ứng dụng Careelot: phân tích AI match, tối ưu CV, cover letter và theo dõi quy trình ứng tuyển.",
  appleWebApp: { capable: true, title: "Careelot", statusBarStyle: "default" },
  icons: {
    icon: "/Careelot_Square.svg",
    apple: "/Careelot_Square.svg",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4952FF" },
    { media: "(prefers-color-scheme: dark)", color: "#1F1F21" },
  ],
};

/** Layout gốc: nạp font, script khởi tạo giao diện và các provider toàn cục. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={googleSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: FONT_SCALE_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: SIDEBAR_BOOTSTRAP }} />
      </head>
      <body>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
          <RegisterServiceWorker />
          <NativeShell />
        </QueryProvider>
      </body>
    </html>
  );
}
