import type { CapacitorConfig } from "@capacitor/cli";

// App Android bọc WebView trỏ thẳng tới site đã deploy (server.url) nên giữ
// nguyên toàn bộ SSR/auth của Next. Đổi URL khi chạy bằng biến CAP_SERVER_URL
// trước lệnh `cap sync` (vd staging, hoặc LAN IP của máy dev để thử bản local).
const SERVER_URL =
  process.env.CAP_SERVER_URL ?? "https://ui-ai-job-search.vercel.app";

const config: CapacitorConfig = {
  appId: "com.careelot.app",
  appName: "Careelot",
  webDir: "capacitor",
  server: {
    url: SERVER_URL,
    androidScheme: "https",
  },
};

export default config;
