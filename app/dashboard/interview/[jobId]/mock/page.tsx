import type { Metadata } from "next";
import { MockInterviewView } from "./mock-view";

export const metadata: Metadata = {
  title: "Phỏng vấn thử",
};

/** Trang phỏng vấn thử: mở `params` và câu chọn sẵn `?q=` rồi giao cho client component. */
export default async function MockInterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ jobId }, { q }] = await Promise.all([params, searchParams]);
  const question = typeof q === "string" ? q.trim().slice(0, 300) : "";
  return <MockInterviewView jobId={jobId} question={question || undefined} />;
}
