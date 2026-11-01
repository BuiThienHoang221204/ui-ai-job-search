"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/ssr";
import { LoginForm } from "@/components/auth/login-form";

type Phase = "checking" | "login" | "done" | "error";

/** Chỉ cho phép quay về đúng URL callback của tiện ích Chrome (…chromiumapp.org)
 * để token không rò ra một trang khác qua open-redirect. */
function isExtRedirect(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && url.hostname.endsWith(".chromiumapp.org")
    );
  } catch {
    return false;
  }
}

export default function ConnectExtensionPage() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [redirect, setRedirect] = useState("");

  const issue = useCallback(async (dest: string) => {
    try {
      const res = await fetch("/api/ext/auth/token", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setPhase("login");
        return;
      }
      const data = (await res.json()) as { token: string };
      setPhase("done");
      window.location.replace(
        `${dest}#token=${encodeURIComponent(data.token)}`,
      );
    } catch {
      setPhase("login");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const dest =
        new URLSearchParams(window.location.search).get("ext_redirect") ?? "";
      if (!isExtRedirect(dest)) {
        setPhase("error");
        return;
      }
      setRedirect(dest);
      await issue(dest);
    })();
  }, [issue]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <Image
            src="/Careelot_Square.svg"
            alt="Careelot"
            width={30}
            height={30}
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Careelot
          </span>
        </div>

        {phase === "checking" && (
          <p className="py-6 text-center text-sm text-slate-500">
            Đang kết nối tiện ích…
          </p>
        )}

        {phase === "done" && (
          <p className="flex items-center justify-center gap-2 py-6 text-center text-sm font-medium text-emerald-600">
            <CheckCircle className="size-5" weight="fill" />
            Đã kết nối! Quay lại tiện ích…
          </p>
        )}

        {phase === "error" && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <WarningCircle className="mt-px size-5 shrink-0" />
            Liên kết kết nối không hợp lệ. Hãy mở lại từ nút “Đăng nhập bằng
            Google” trong tiện ích Careelot.
          </p>
        )}

        {phase === "login" && (
          <>
            <h1 className="mb-1 text-base font-semibold text-slate-900">
              Kết nối tài khoản với tiện ích
            </h1>
            <p className="mb-5 text-sm text-slate-500">
              Đăng nhập để tiện ích Careelot lưu việc và soi độ hợp với hồ sơ
              của bạn.
            </p>
            <LoginForm onSuccess={() => void issue(redirect)} />
          </>
        )}
      </div>
    </main>
  );
}
