import { redirect } from "next/navigation";

/** Trang chủ: chuyển thẳng sang dashboard. */
export default function Home() {
  redirect("/dashboard");
}
