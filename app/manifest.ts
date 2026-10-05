import type { MetadataRoute } from "next";

/** Web app manifest cho PWA, Next phục vụ ở /manifest.webmanifest. */
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
      { src: "/Careelot_Square.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/Careelot_Square.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/Careelot_Square.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
