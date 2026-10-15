import { useContext } from "react";
import { ToastContext, type ToastApi } from "@/providers/toast-provider";

/** Lấy API hiện thông báo toast, phải nằm trong `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error("useToast phải nằm trong ToastProvider");
  }
  return api;
}
