import type { Metadata } from "next";
import { MockInterviewView } from "./mock-view";

export const metadata: Metadata = {
  title: "Phỏng vấn thử",
};

/** Trang phỏng vấn thử: mở `params` rồi giao cho client component. */
export default async function MockInterviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <MockInterviewView jobId={jobId} />;
}
