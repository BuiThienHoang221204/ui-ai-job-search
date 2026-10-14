import { Suspense } from "react";
import type { Metadata } from "next";
import { InterviewView } from "./interview-view";

export const metadata: Metadata = {
  title: "Chuẩn bị phỏng vấn",
};

/** Trang chuẩn bị phỏng vấn: khai metadata và bọc InterviewView trong Suspense vì nó đọc `?job=`. */
export default function InterviewPage() {
  return (
    <Suspense>
      <InterviewView />
    </Suspense>
  );
}
