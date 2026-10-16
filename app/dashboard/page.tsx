import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Tổng quan — Careelot" };

export default function DashboardPage() {
  return <DashboardView />;
}
