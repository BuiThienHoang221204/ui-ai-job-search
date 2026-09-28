import { Suspense } from "react";
import type { Metadata } from "next";
import { CvOptimizerView } from "./cv-optimizer-view";

export const metadata: Metadata = { title: "Tối ưu CV — Careelot" };

/** Trang tối ưu CV: khai metadata và bọc CvOptimizerView trong Suspense. */
export default function CvOptimizerPage() {
  return (
    <Suspense>
      <CvOptimizerView />
    </Suspense>
  );
}
