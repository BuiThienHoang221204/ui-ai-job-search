import type { MetadataRoute } from "next";
import { salaryService } from "@/services/salary";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 86_400;

/** Chỉ trang công khai muốn được index; backend không trả lời lúc build thì vẫn có trang gốc. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/salary` }];
  try {
    const positions = await salaryService.positions();
    for (const position of positions) {
      pages.push({ url: `${SITE_URL}/salary/${position.positionSlug}` });
    }
  } catch {
    return pages;
  }
  return pages;
}
