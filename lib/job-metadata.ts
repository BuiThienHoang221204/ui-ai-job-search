import type { Metadata } from "next";
import type { PublicJobDetail } from "@/types";

const API = `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api`;
const REVALIDATE_SECONDS = 300;
const METADATA_TIMEOUT_MS = 3_000;
const NO_INDEX = { index: false, follow: false };

/** Tiêu đề và mô tả hiện khi dán link tin vào Zalo, Facebook. */
export function metadataForJob(job: PublicJobDetail): Metadata {
  const title = `${job.title} — ${job.company}`;
  let description = `${job.company} tuyển ${job.title}.`;
  if (job.location) {
    description = `${job.company} tuyển ${job.title} tại ${job.location}.`;
  }
  return {
    title: `${title} | Careelot`,
    description,
    openGraph: { title, description, type: "website" },
    robots: NO_INDEX,
  };
}

/** Đọc tin công khai từ server component; không đọc được thì giữ tiêu đề chung của trang. */
export async function jobMetadata(
  id: string,
  fallbackTitle: string,
): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/public/jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(METADATA_TIMEOUT_MS),
    });
    if (res.ok) return metadataForJob((await res.json()) as PublicJobDetail);
  } catch {}
  return { title: fallbackTitle, robots: NO_INDEX };
}
