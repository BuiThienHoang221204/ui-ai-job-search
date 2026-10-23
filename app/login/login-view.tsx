"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { safeNextPath } from "@/lib/redirect";

/** Trang đăng nhập đầy đủ, xong chuyển về trang `next`. */
function LoginPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), "/dashboard");

  /** Điều hướng về `next` sau khi cookie đã được backend đặt xong. */
  function goToNext() {
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo className="h-[40px] w-[160px]" />
          <p className="text-sm text-slate-500">
            Đăng nhập để xem việc làm phù hợp với hồ sơ của bạn
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <LoginForm onSuccess={goToNext} />
        </div>

        <p className="text-center text-xs text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-slate-900 underline underline-offset-2"
          >
            Tạo tài khoản
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Trang đăng nhập, bọc trong Suspense vì dùng useSearchParams. */
export function LoginView() {
  return (
    <Suspense>
      <LoginPanel />
    </Suspense>
  );
}
