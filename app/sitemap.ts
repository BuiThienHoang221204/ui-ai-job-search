import type { MetadataRoute } from "next";
import { marketService } from "@/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Trang công khai muốn Google index: báo cáo thị trường theo ngành. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const occupations = await marketService.occupations();
  return [
    { url: `${SITE_URL}/dashboard/market`, changeFrequency: "daily" },
    ...occupations.map((occupation) => ({
      url: `${SITE_URL}/dashboard/market/${occupation.slug}`,
      changeFrequency: "daily" as const,
    })),
  ];
}
