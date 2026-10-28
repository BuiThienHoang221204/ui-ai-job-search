"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLoginModal } from "@/hooks/use-login-modal";
import { useSession } from "@/hooks/use-session";
import { safeNextPath } from "@/lib/redirect";

/** Mở modal theo `?auth=login|register` (đường dẫn cũ `/login`, `/register` chuyển về đây) rồi gỡ tham số khỏi URL; đã đăng nhập thì đi thẳng tới `next`. */
export function AuthFromUrl() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const auth = params.get("auth");

  useEffect(() => {
    if (auth !== "login" && auth !== "register") return;
    const next = safeNextPath(params.get("next"), "");
    if (user) {
      router.replace(next || pathname);
      return;
    }
    useLoginModal.getState().open({ mode: auth, next: next || undefined });
    const rest = new URLSearchParams(params);
    rest.delete("auth");
    rest.delete("next");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [auth, params, pathname, router, user]);

  return null;
}
