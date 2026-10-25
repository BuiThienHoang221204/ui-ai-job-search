"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Gift } from "@phosphor-icons/react/ssr";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { safeNextPath } from "@/lib/redirect";

/** Trang tạo tài khoản đầy đủ, xong chuyển về trang `next`. */
function RegisterPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), "/dashboard");
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const referral = params.get("ref") ?? undefined;

  /** Điều hướng về `next` sau khi cookie đã được backend đặt xong. */
  function goToNext() {
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <BrandLogo className="h-[32px] w-[128px]" />
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Tạo tài khoản
          </h1>
          <p className="text-sm text-slate-500">
            Điền hồ sơ một lần, hệ thống tự chấm điểm mọi tin tuyển dụng mới
          </p>
        </div>

        {referral && (
          <p className="border-primary-100 bg-primary-50 text-primary-800 flex gap-2 rounded-xl border px-3 py-2 text-xs">
            <Gift className="size-4 shrink-0" weight="fill" />
            Bạn được mời: đăng ký và chọn ngành nghề để cả bạn và người mời được
            thêm 15 phút luyện phỏng vấn bằng giọng nói.
          </p>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <RegisterForm
            onSuccess={goToNext}
            onLoginInstead={() => router.push(loginHref)}
            referral={referral}
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
