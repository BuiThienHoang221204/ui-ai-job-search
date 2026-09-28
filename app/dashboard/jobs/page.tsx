import { Suspense } from "react";
import type { Metadata } from "next";
import { JobsView } from "./jobs-view";

export const metadata: Metadata = { title: "Việc làm phù hợp — Careelot" };

/** Trang việc làm; bọc JobsView trong Suspense vì dùng useSearchParams. */
export default function JobsPage() {
  return (
    <Suspense>
      <JobsView />
    </Suspense>
  );
}
