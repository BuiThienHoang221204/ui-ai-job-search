"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn, WarningCircle } from "@phosphor-icons/react/ssr";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";
import { safeNextPath } from "@/utils";

import { BrandLogo } from "@/components/dashboard/brand-logo";

/** Form đăng nhập bằng email/mật khẩu, xong chuyển về trang `next`. */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Dùng chung cho cả email/mật khẩu và Google: điều hướng về `next` sau khi cookie đã được backend đặt xong. */
  function goToNext() {
    router.replace(next);
    router.refresh();
  }

  /** Gửi thông tin đăng nhập, điều hướng khi thành công hoặc hiện lỗi. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      goToNext();
    } catch (error) {
      setError(
        apiErrorStatus(error) === 401
          ? "Email hoặc mật khẩu không đúng"
          : apiErrorMessage(error, "Đăng nhập không thành công"),
      );
    } finally {
      setLoading(false);
    }
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ban@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"
            >
              <WarningCircle className="mt-px size-4.5 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {!loading && <SignIn className="size-4.5" />}
            Đăng nhập
          </Button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            hoặc
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex justify-center">
            <GoogleSignInButton
              onSuccess={goToNext}
              onError={(message) => setError(message)}
            />
          </div>
        </form>

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

/** Trang đăng nhập, bọc form trong Suspense vì dùng useSearchParams. */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
