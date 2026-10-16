import type { Metadata } from "next";
import { ApplicationsView } from "./applications-view";

export const metadata: Metadata = { title: "Lịch sử ứng tuyển — Careelot" };

export default function ApplicationsPage() {
  return <ApplicationsView />;
}
