import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { QueryProvider } from "@/lib/query-client";
import { ToastProvider } from "@/components/ui/toast";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
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

export const metadata: Metadata = {
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
        </QueryProvider>
      </body>
    </html>
  );
}
