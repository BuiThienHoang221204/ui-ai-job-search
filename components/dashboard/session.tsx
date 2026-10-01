"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react/ssr";
import type { AuthUser } from "@/types";
import { apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";

interface SessionValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
  logout: async () => { },
});

/**
 * Nạp người dùng hiện tại một lần cho cả khung dashboard, và CHẶN render con
 * cho tới khi biết chắc đã đăng nhập. Không có middleware nào chặn trước -
 * chặn ở đây là lớp duy nhất, nên lộ `children` trước khi `/auth/me` trả lời
 * là lộ cả khung dashboard cho người chưa đăng nhập trong một nhịp.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch (error) {
        if (!cancelled && apiErrorStatus(error) === 401) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy lại khi router đổi, không phải mỗi lần pathname đổi trong cùng phiên.
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    }
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  if (loading || !user) {
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

/** Đọc phiên đăng nhập hiện tại từ `SessionProvider`. */
export const useSession = () => useContext(SessionContext);
