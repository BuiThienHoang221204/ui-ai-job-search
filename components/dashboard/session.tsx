"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
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

/** Nạp người dùng hiện tại một lần cho cả khung dashboard. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  return (
    <SessionContext.Provider value={{ user, loading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

/** Đọc phiên đăng nhập hiện tại từ `SessionProvider`. */
export const useSession = () => useContext(SessionContext);
