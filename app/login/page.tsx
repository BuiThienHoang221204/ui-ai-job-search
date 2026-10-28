import { redirect } from "next/navigation";
import { authEntryPath } from "@/lib/redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(authEntryPath("login", await searchParams));
}
