import { redirect } from "next/navigation";
import { authEntryPath } from "@/lib/redirect";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(authEntryPath("register", await searchParams));
}
