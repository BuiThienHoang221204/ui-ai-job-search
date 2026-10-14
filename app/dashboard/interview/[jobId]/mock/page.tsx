import type { Metadata } from "next";
import { MockInterviewView } from "./mock-view";

export const metadata: Metadata = {
  title: "Phỏng vấn thử",
};

/** Trang phỏng vấn thử: mở `params`, câu chọn sẵn `?q=` và buổi cần mở `?run=` rồi giao cho client component. */
export default async function MockInterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ q?: string | string[]; run?: string | string[] }>;
}) {
  const [{ jobId }, { q, run }] = await Promise.all([params, searchParams]);
  const question = typeof q === "string" ? q.trim().slice(0, 300) : "";
  return (
    <MockInterviewView
      jobId={jobId}
      question={question || undefined}
      runId={typeof run === "string" ? run : undefined}
    />
  );
}
