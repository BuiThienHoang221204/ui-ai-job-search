import type { Metadata } from "next";
import { UploadCvView } from "./upload-view";

export const metadata: Metadata = {
  title: "Đọc hồ sơ từ CV — Careelot",
};

/** Trang tải CV; server component chỉ để khai metadata. */
export default function UploadCvPage() {
  return <UploadCvView />;
}
