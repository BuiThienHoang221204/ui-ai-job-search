import type { Metadata } from "next";
import { MatchesView } from "./matches-view";

export const metadata: Metadata = { title: "Đã chấm bằng AI — Careelot" };

/** Trang việc phù hợp. */
export default function MatchesPage() {
  return <MatchesView />;
}
