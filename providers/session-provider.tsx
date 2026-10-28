"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CircleNotch } from "@phosphor-icons/react/ssr";
import type { AuthUser } from "@/types";
import { apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";
import { isGuestPath } from "@/lib/public-job";

export interface SessionValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
  logout: async () => { },
  refresh: async () => { },
});

/** Nạp người dùng một lần cho cả khung dashboard và chặn render con tới khi biết chắc đã đăng nhập; trang trong `isGuestPath` thì khách xem được với `user = null`. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const queryClient = useQueryClient();
  const guestAllowed = anonymous && isGuestPath(pathname);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch (error) {
        if (!cancelled && apiErrorStatus(error) === 401) setAnonymous(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!anonymous || isGuestPath(pathname)) return;
    const next = pathname + window.location.search;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [anonymous, pathname, router]);

  const refresh = useCallback(async () => {
    setUser(await authService.me());
    setAnonymous(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    }
    queryClient.clear();
    setUser(null);
    setAnonymous(true);
    router.replace("/dashboard");
  }, [queryClient, router]);

  if (loading || (!user && !guestAllowed)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <CircleNotch className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}
