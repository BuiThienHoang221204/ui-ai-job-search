import type { MarketOccupation, MarketReport } from "@/types";

const API = `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api`;
const REVALIDATE_SECONDS = 86_400;

export const marketService = {
  occupations: async (): Promise<MarketOccupation[]> => {
    const res = await fetch(`${API}/public/market`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`Market API ${res.status}`);
    return res.json() as Promise<MarketOccupation[]>;
  },

  /** Báo cáo 30 ngày của một ngành, `null` khi ngành chưa đủ tin; cache 1 ngày. */
  report: async (slug: string): Promise<MarketReport | null> => {
    const res = await fetch(
      `${API}/public/market/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Market API ${res.status} ${slug}`);
    return res.json() as Promise<MarketReport>;
  },

  /** Tổng số tin đang hiện cho khách; cache 1 ngày như báo cáo thị trường. */
  jobCount: async (): Promise<number> => {
    const res = await fetch(`${API}/public/jobs?limit=1`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`Public jobs API ${res.status}`);
    const page = (await res.json()) as { total: number };
    return page.total;
  },
};
