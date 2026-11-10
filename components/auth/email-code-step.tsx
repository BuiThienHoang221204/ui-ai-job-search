"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, EnvelopeSimple, ShieldCheck } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { apiErrorMessage, apiErrorReason } from "@/lib/axios";
import { cn } from "@/lib/cn";
import { authService } from "@/services";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

interface EmailCodeStepProps {
  email: string;
  purpose: "signup" | "login";
  onVerified: () => void;
  onEditEmail?: () => void;
}

/** Bước nhập mã 6 số gửi qua email, dùng cho đăng ký và cho tài khoản cũ đăng nhập lần đầu; đủ 6 số thì tự xác minh. */
export function EmailCodeStep({
  email,
  purpose,
  onVerified,
  onEditEmail,
}: EmailCodeStepProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const submit = async (value: string) => {
    setLoading(true);
    setError("");
    try {
      await authService.verifyCode(email, value);
      onVerified();
    } catch (err) {
      if (apiErrorReason(err) === "CODE_EXPIRED") setExpired(true);
      setError(apiErrorMessage(err, "Chưa xác minh được, thử lại sau ít phút."));
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const change = (raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(value);
    setError("");
    if (value.length === CODE_LENGTH) void submit(value);
  };

  const resend = async () => {
    setLoading(true);
    setError("");
    try {
      await authService.resendCode(email);
      setExpired(false);
      setCode("");
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(apiErrorMessage(err, "Chưa gửi được mã, thử lại sau ít phút."));
    } finally {
      setLoading(false);
    }
  };

  let Chip = purpose === "login" ? ShieldCheck : EnvelopeSimple;
  if (expired) Chip = Clock;

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-4 size-14">
        <Image src="/Careelot_Square.svg" alt="" width={56} height={56} />
        <span
          className={cn(
            "absolute -right-2 -bottom-1 grid size-[26px] place-items-center rounded-lg border-2 border-white text-white",
            expired ? "bg-amber-500" : "bg-primary-600",
          )}
        >
          <Chip className="size-3.5" weight="bold" />
        </span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-slate-900">
        {purpose === "signup"
          ? "Xác minh email"
          : "Xác minh email để tiếp tục"}
      </h3>
      <p className="mb-5 text-sm text-slate-500">
        {purpose === "login" &&
          "Để bảo vệ tài khoản, Careelot cần xác nhận email này là của bạn. "}
        Nhập mã 6 số vừa gửi tới
        <br />
        <b className="text-slate-900">{email}</b>
        {onEditEmail && (
          <button
            type="button"
            onClick={onEditEmail}
            className="ml-1.5 font-semibold text-primary-600"
          >
            Sửa
          </button>
        )}
      </p>

      {expired ? (
        <>
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-800">
            {error}
          </p>
          <Button
            className="w-full"
            size="lg"
            loading={loading}
            onClick={() => void resend()}
          >
            Gửi mã mới
          </Button>
        </>
      ) : (
        <>
          <label className="group relative mx-auto block w-fit cursor-text">
            <span className="sr-only">Mã xác minh 6 số</span>
            <input
              value={code}
              onChange={(event) => change(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              disabled={loading}
              maxLength={CODE_LENGTH}
              className="absolute inset-0 h-full w-full opacity-0"
            />
            <span className="flex gap-2" aria-hidden>
              {Array.from({ length: CODE_LENGTH }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "grid h-14 w-12 place-items-center rounded-xl border-[1.5px] text-[22px] font-semibold text-slate-900",
                    error ? "border-red-300 bg-red-50" : "border-slate-200",
                    i === Math.min(code.length, CODE_LENGTH - 1) &&
                      !error &&
                      "group-focus-within:border-primary-600 group-focus-within:ring-4 group-focus-within:ring-primary-50",
                  )}
                >
                  {code[i] ?? ""}
                </span>
              ))}
            </span>
          </label>
          <p
            role={error ? "alert" : undefined}
            className={cn(
              "mt-2 min-h-5 text-xs",
              error ? "text-red-600" : "text-slate-500",
            )}
          >
            {error || "Mã có hiệu lực 10 phút."}
          </p>
          <Button
            className="mt-3 w-full"
            size="lg"
            loading={loading}
            disabled={code.length < CODE_LENGTH}
            onClick={() => void submit(code)}
          >
            {purpose === "signup"
              ? "Xác minh và tạo tài khoản"
              : "Xác minh và đăng nhập"}
          </Button>
          <p className="mt-3.5 text-xs text-slate-500">
            Chưa nhận được mã? Xem cả mục Spam, hoặc{" "}
            <button
              type="button"
              onClick={() => void resend()}
              disabled={wait > 0 || loading}
              className="font-semibold text-primary-600 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Gửi lại mã{wait > 0 && ` (${wait}s)`}
            </button>
          </p>
        </>
      )}
    </div>
  );
}
