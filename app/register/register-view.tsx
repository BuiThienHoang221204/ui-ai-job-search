"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { safeNextPath } from "@/lib/redirect";

/** Trang tạo tài khoản đầy đủ, xong chuyển về trang `next`. */
function RegisterPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), "/dashboard");
  const loginHref = `/login?next=${encodeURIComponent(next)}`;

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
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Tạo tài khoản
          </h1>
          <p className="text-sm text-slate-500">
            Điền hồ sơ một lần, hệ thống tự chấm điểm mọi tin tuyển dụng mới
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <RegisterForm
            onSuccess={goToNext}
            onLoginInstead={() => router.push(loginHref)}
          />
        </div>

        <p className="text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <Link
            href={loginHref}
            className="font-semibold text-slate-900 underline underline-offset-2"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Trang đăng ký, bọc trong Suspense vì dùng useSearchParams. */
export function RegisterView() {
  return (
    <Suspense>
      <RegisterPanel />
    </Suspense>
  );
}
