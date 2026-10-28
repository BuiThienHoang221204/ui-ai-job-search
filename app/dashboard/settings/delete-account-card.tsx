"use client";

import { useState } from "react";
import { Trash } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useSession } from "@/hooks/use-session";
import { apiErrorMessage } from "@/lib/axios";
import { authService } from "@/services";

const CONFIRM_WORD = "XOÁ";

/** Vùng xoá tài khoản: hỏi lại bằng cách gõ chữ xác nhận, xoá xong thì đăng xuất về trang chủ. */
export function DeleteAccountCard() {
  const { logout } = useSession();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await authService.deleteAccount();
      await logout();
    } catch (err) {
      setError(apiErrorMessage(err, "Chưa xoá được tài khoản. Thử lại sau."));
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-rose-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-rose-600">Xoá tài khoản</h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Xoá vĩnh viễn tài khoản và mọi dữ liệu: hồ sơ, file CV, CV và thư đã
        tạo, lịch sử phỏng vấn, tin đã lưu. Không khôi phục được.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Muốn giữ lại? Hãy tải các CV cần dùng trước khi xoá.
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Trash className="size-4" />
          Xoá tài khoản
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Xoá tài khoản?"
        className="max-w-md"
      >
        <p className="text-sm text-slate-600">
          Những thứ sau bị xoá ngay và không khôi phục được:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Hồ sơ và các file CV đã tải lên</li>
          <li>CV và thư xin việc đã tạo</li>
          <li>Lịch sử phỏng vấn thử, tin đã lưu, đơn ứng tuyển</li>
        </ul>
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="confirm-delete">
            Gõ <b>{CONFIRM_WORD}</b> để xác nhận
          </Label>
          <Input
            id="confirm-delete"
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            disabled={typed.trim().toUpperCase() !== CONFIRM_WORD}
            onClick={() => void handleDelete()}
          >
            Xoá vĩnh viễn
          </Button>
        </div>
      </Modal>
    </section>
  );
}
