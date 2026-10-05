"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { authService } from "@/services";

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Nút "Đăng nhập bằng Google", dùng chung cho /login và /register - ẩn hẳn khi chưa cấu hình Client ID thay vì hiện một nút lúc nào cũng lỗi. */
export function GoogleSignInButton({
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={(credential) => {
          if (!credential.credential) {
            onError("Không nhận được token từ Google");
            return;
          }
          authService
            .googleLogin(credential.credential)
            .then(onSuccess)
            .catch(() => onError("Đăng nhập bằng Google không thành công"));
        }}
        onError={() => onError("Đăng nhập bằng Google không thành công")}
        width="312"
        shape="rectangular"
      />
    </GoogleOAuthProvider>
  );
}
