"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { authService } from "@/services";

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  referral?: string;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const MAX_WIDTH = 400;

/** Nút "Đăng nhập bằng Google", dùng chung cho form đăng nhập và đăng ký trong modal; ẩn hẳn khi chưa cấu hình Client ID thay vì hiện một nút lúc nào cũng lỗi. Đo chiều rộng container để nút khớp với nút "Đăng nhập" full-width mà không tràn trên mobile. */
export function GoogleSignInButton({
  onSuccess,
  onError,
  referral,
}: GoogleSignInButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.min(el.clientWidth, MAX_WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div ref={ref} className="w-full">
        <GoogleLogin
          onSuccess={(credential) => {
            if (!credential.credential) {
              onError("Không nhận được token từ Google");
              return;
            }
            authService
              .googleLogin(credential.credential, referral)
              .then(onSuccess)
              .catch(() => onError("Đăng nhập bằng Google không thành công"));
          }}
          onError={() => onError("Đăng nhập bằng Google không thành công")}
          width={String(width)}
          size="large"
          shape="rectangular"
          logo_alignment="center"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
