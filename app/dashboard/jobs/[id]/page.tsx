import type { Metadata } from "next";
import { jobMetadata } from "@/lib/job-metadata";
import { JobDetailView } from "./job-detail-view";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return jobMetadata(id, "Chi tiết việc làm — Careelot");
}

/** Trang chi tiết việc làm; server component chỉ để khai metadata. */
export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailView jobId={id} />;
}
