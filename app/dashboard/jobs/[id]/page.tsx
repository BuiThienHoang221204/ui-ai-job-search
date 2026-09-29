import type { Metadata } from "next";
import { JobDetailView } from "./job-detail-view";

export const metadata: Metadata = {
  title: "Chi tiết việc làm — Careelot",
};

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Trang chi tiết việc làm; server component chỉ để khai metadata. */
export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailView jobId={id} />;
}
