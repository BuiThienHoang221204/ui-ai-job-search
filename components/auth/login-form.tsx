"use client";

import { useState } from "react";
import Link from "next/link";
import { SignIn, WarningCircle } from "@phosphor-icons/react/ssr";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/legal";
import { authService } from "@/services";

/** Form đăng nhập email/mật khẩu và Google trong modal đăng nhập. */
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Gửi thông tin đăng nhập, gọi `onSuccess` khi thành công hoặc hiện lỗi. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      onSuccess();
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onSuccess={onSuccess}
          onError={(message) => setError(message)}
        />
      </div>

      <p className="text-center text-xs text-slate-500">
        Khi đăng nhập, bạn đồng ý với{" "}
        <Link href={TERMS_PATH} className="text-primary-600 font-semibold">
          Điều khoản sử dụng
        </Link>{" "}
        và{" "}
        <Link href={PRIVACY_PATH} className="text-primary-600 font-semibold">
          Chính sách bảo mật
        </Link>
        .
      </p>
    </form>
  );
}
