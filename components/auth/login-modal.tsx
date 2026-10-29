"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { useLoginModal } from "@/hooks/use-login-modal";
import { useSession } from "@/hooks/use-session";
import { AuthFromUrl } from "./auth-from-url";
import { ModalForms } from "./modal-forms";

/** Modal đăng nhập/đăng ký cho khách, mở qua `useLoginModal().open(...)`; xong thì nạp lại phiên và dữ liệu tại chỗ, không tải lại trang, nên trạng thái đang có (ví dụ bảng điểm CV) còn nguyên. */
export function LoginModal() {
  const { isOpen, reason, next, mode, setMode, close } = useLoginModal();
  const { refresh } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const login = mode === "login";

  const finish = async () => {
    await refresh();
    await queryClient.resetQueries();
    close();
    if (next) router.push(next);
  };

  let hint =
    "Tạo tài khoản miễn phí để lưu tin, chấm điểm phù hợp và tạo CV theo từng tin.";
  if (login) hint = "Đăng nhập để dùng đầy đủ tính năng của Careelot.";

  return (
    <>
      <Suspense>
        <AuthFromUrl />
      </Suspense>
      <Modal
        open={isOpen}
        onClose={close}
        className="max-w-[452px]"
        title={login ? "Đăng nhập để tiếp tục" : "Tạo tài khoản"}
      >
        <p className="-mt-2 mb-4 text-sm text-slate-500">{reason ?? hint}</p>

        <Suspense>
          <ModalForms onSuccess={() => void finish()} />
        </Suspense>

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
    </>
  );
}
