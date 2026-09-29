import type { Metadata } from "next";
import { UpskillView } from "./upskill-view";

export const metadata: Metadata = {
  title: "Lộ trình học",
};

/** Trang nâng cấp kỹ năng; server component chỉ để khai metadata. */
export default function UpskillPage() {
  return <UpskillView />;
}
