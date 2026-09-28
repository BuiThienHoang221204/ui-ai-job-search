"use client";

import { useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { apiErrorStatus } from "@/lib/axios";

/** Cung cấp QueryClient cho app, chuyển về trang đăng nhập khi gặp lỗi 401. */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const onUnauthorized = (error: unknown) => {
      if (apiErrorStatus(error) !== 401) return;
      if (typeof window === "undefined") return;
      if (window.location.pathname.startsWith("/login")) return;
      const next = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Nạp lại cả trang là CHỦ ĐÍCH, xem docblock: điều hướng SPA sẽ giữ nguyên cache Query của phiên vừa hết hạn.
      window.location.assign(`/login?next=${next}`);
    };

    return new QueryClient({
      queryCache: new QueryCache({ onError: onUnauthorized }),
      mutationCache: new MutationCache({ onError: onUnauthorized }),
      defaultOptions: {
        queries: {
          retry: (failureCount, error) => {
            const status = apiErrorStatus(error);
            if (status && status >= 400 && status < 500) return false;
            return failureCount < 2;
          },
          refetchOnWindowFocus: false,
          staleTime: 30_000,
        },
      },
    });
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
