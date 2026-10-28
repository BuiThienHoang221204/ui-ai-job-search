import type { Metadata } from "next";
import { marketService } from "@/services";
import { DashboardEntry } from "./dashboard-entry";

export const metadata: Metadata = { title: "Tổng quan — Careelot" };

export default async function DashboardPage() {
  const [occupations, jobCount] = await Promise.all([
    marketService.occupations().catch(() => []),
    marketService.jobCount().catch(() => null),
  ]);
  return <DashboardEntry occupations={occupations} jobCount={jobCount} />;
}
