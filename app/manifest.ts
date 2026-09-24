import type { MetadataRoute } from "next";

// Next phục vụ file này ở /manifest.webmanifest và tự chèn <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Careelot",
    short_name: "Careelot",
    description: "Trợ lý tìm việc: việc làm phù hợp, CV, thư xin việc và theo dõi ứng tuyển.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    lang: "vi",
    background_color: "#FAFAFB",
    theme_color: "#4952FF",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
