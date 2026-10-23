"use client";

import dynamic from "next/dynamic";
import { Modal } from "@/components/ui/modal";
import { useLoginModal } from "@/hooks/use-login-modal";

const LoginForm = dynamic(() =>
  import("@/components/auth/login-form").then((m) => m.LoginForm),
);
const RegisterForm = dynamic(() =>
  import("@/components/auth/register-form").then((m) => m.RegisterForm),
);

/** Modal đăng nhập/đăng ký cho khách, mở qua `useLoginModal().open(...)`; xong thì nạp lại cả trang để đọc phiên mới và bỏ cache của lúc còn là khách. */
export function LoginModal() {
  const { isOpen, reason, next, mode, setMode, close } = useLoginModal();
  const login = mode === "login";
  const reloadInto = () => {
    window.location.href = next ?? window.location.href;
  };
  let hint = "Tạo tài khoản miễn phí để lưu tin, chấm điểm phù hợp và tạo CV theo từng tin.";
  if (login) hint = "Đăng nhập để dùng đầy đủ tính năng của Careelot.";

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title={login ? "Đăng nhập để tiếp tục" : "Tạo tài khoản"}
    >
      <p className="-mt-2 mb-4 text-sm text-slate-500">
        {reason ?? hint}
      </p>

      {login && <LoginForm onSuccess={reloadInto} />}
      {!login && (
        <RegisterForm
          onSuccess={reloadInto}
          onLoginInstead={() => setMode("login")}
        />
      )}

      <p className="mt-4 text-center text-xs text-slate-500">
        {login ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <button
          type="button"
          onClick={() => setMode(login ? "register" : "login")}
          className="font-semibold text-slate-900 underline underline-offset-2"
        >
          {login ? "Tạo tài khoản" : "Đăng nhập"}
        </button>
      </p>
    </Modal>
  );
}
