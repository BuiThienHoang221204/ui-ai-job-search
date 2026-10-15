import { Suspense } from "react";
import type { Metadata } from "next";
import { jobMetadata } from "@/lib/job-metadata";
import { JobsView } from "./jobs-view";

const TITLE = "Việc làm phù hợp — Careelot";

interface JobsPageProps {
  searchParams: Promise<{ job?: string | string[] }>;
}

export async function generateMetadata({
  searchParams,
}: JobsPageProps): Promise<Metadata> {
  const { job } = await searchParams;
  if (typeof job === "string" && job) return jobMetadata(job, TITLE);
  return { title: TITLE, robots: { index: false, follow: false } };
}

/** Trang việc làm; bọc JobsView trong Suspense vì dùng useSearchParams. */
export default function JobsPage() {
  return (
    <Suspense>
      <JobsView />
    </Suspense>
  );
}
