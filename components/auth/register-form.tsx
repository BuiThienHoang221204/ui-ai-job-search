"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, WarningCircle } from "@phosphor-icons/react/ssr";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { cn } from "@/lib/cn";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/legal";
import { authService } from "@/services";

const MIN_PASSWORD_LENGTH = 8;

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginInstead: () => void;
  referral?: string;
}

/** Form tạo tài khoản trong modal đăng nhập. */
export function RegisterForm({
  onSuccess,
  onLoginInstead,
  referral,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  /** Kiểm tra dữ liệu, gọi API đăng ký và xử lý lỗi trùng email. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setDuplicate(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
      return;
    }
    if (password !== confirm) {
      setError("Hai lần nhập mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password, name, referral);
      onSuccess();
    } catch (err) {
      if (apiErrorStatus(err) === 409) {
        setDuplicate(true);
      } else {
        setError(apiErrorMessage(err, "Tạo tài khoản không thành công"));
      }
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Họ và tên</Label>
        <Input
          id="name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
        <p className="text-xs text-slate-400">
          Ít nhất {MIN_PASSWORD_LENGTH} ký tự
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Nhập lại mật khẩu</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="••••••••"
        />
      </div>

      {duplicate && (
        <p
          role="alert"
          className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
        >
          Email này đã được đăng ký.{" "}
          <button
            type="button"
            onClick={onLoginInstead}
            className="font-semibold underline underline-offset-2"
          >
            Đăng nhập thay vì tạo mới
          </button>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"
        >
          <WarningCircle className="mt-px size-4.5 shrink-0" />
          {error}
        </p>
      )}

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="accent-primary-600 mt-0.5 size-4 shrink-0"
        />
        <span>
          Tôi đồng ý với{" "}
          <Link
            href={TERMS_PATH}
            target="_blank"
            className="text-primary-600 font-semibold"
          >
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link
            href={PRIVACY_PATH}
            target="_blank"
            className="text-primary-600 font-semibold"
          >
            Chính sách bảo mật
          </Link>
          , gồm việc gửi chữ của CV và hồ sơ tới nhà cung cấp AI ở nước ngoài để
          phân tích.
        </span>
      </label>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={!accepted}
      >
        {!loading && <UserPlus className="size-4.5" />}
        Tạo tài khoản
      </Button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        hoặc
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div
        aria-disabled={!accepted}
        className={cn(
          "flex justify-center",
          !accepted && "pointer-events-none opacity-50",
        )}
      >
        <GoogleSignInButton
          onSuccess={onSuccess}
          onError={(message) => setError(message)}
          referral={referral}
        />
      </div>
    </form>
  );
}
