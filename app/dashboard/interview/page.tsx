import type { Metadata } from "next";
import { InterviewView } from "./interview-view";

export const metadata: Metadata = {
  title: "Chuẩn bị phỏng vấn",
};

/** Trang chuẩn bị phỏng vấn: khai metadata rồi giao cho InterviewView. */
export default function InterviewPage() {
  return <InterviewView />;
}
