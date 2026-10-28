import type { MetadataRoute } from "next";
import { marketService } from "@/services";
import { salaryService } from "@/services/salary";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Trang công khai muốn Google index: phân tích CV, báo cáo thị trường theo ngành và tra cứu lương theo vị trí. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [occupations, positions] = await Promise.all([
    marketService.occupations(),
    salaryService.positions(),
  ]);
  return [
    { url: `${SITE_URL}/dashboard/cv-check`, changeFrequency: "monthly" },
    { url: `${SITE_URL}/dashboard/market`, changeFrequency: "daily" },
    ...occupations.map((occupation) => ({
      url: `${SITE_URL}/dashboard/market/${occupation.slug}`,
      changeFrequency: "daily" as const,
    })),
    { url: `${SITE_URL}/dashboard/salary`, changeFrequency: "weekly" },
    ...positions.map((position) => ({
      url: `${SITE_URL}/dashboard/salary/${position.positionSlug}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
