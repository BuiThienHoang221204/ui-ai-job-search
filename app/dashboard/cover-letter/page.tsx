import { Suspense } from "react";
import type { Metadata } from "next";
import { CoverLetterView } from "./cover-letter-view";

export const metadata: Metadata = { title: "Thư xin việc — Careelot" };

/** Trang thư xin việc: khai metadata và bọc CoverLetterView trong Suspense. */
export default function CoverLetterPage() {
  return (
    <Suspense>
      <CoverLetterView />
    </Suspense>
  );
}
