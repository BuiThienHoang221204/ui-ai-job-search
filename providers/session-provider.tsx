"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react/ssr";
import type { AuthUser } from "@/types";
import { apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";
import { isGuestPath } from "@/lib/public-job";

export interface SessionValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
  logout: async () => { },
});

/**
 * Nạp người dùng hiện tại một lần cho cả khung dashboard, và CHẶN render con
 * cho tới khi biết chắc đã đăng nhập. Không có middleware nào chặn trước -
 * chặn ở đây là lớp duy nhất, nên lộ `children` trước khi `/auth/me` trả lời
 * là lộ cả khung dashboard cho người chưa đăng nhập trong một nhịp.
 * Ngoại lệ duy nhất là trang việc làm (`isGuestPath`): khách xem được với `user = null`.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
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

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    }
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  if (loading || (!user && !guestAllowed)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <CircleNotch className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, loading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
