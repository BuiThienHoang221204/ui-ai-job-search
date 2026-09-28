import { redirect } from "next/navigation";

/** Route cũ, chuyển hướng về `/dashboard/jobs` để giữ link và bookmark. */
export default function AllJobsPage() {
  redirect("/dashboard/jobs");
}
