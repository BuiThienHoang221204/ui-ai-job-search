import axios, { AxiosError } from "axios";

export const AUTH_COOKIE = "aijob_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: {
    serialize: (params: Record<string, unknown>) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) search.append(key, String(item));
        } else {
          search.append(key, String(value));
        }
      }
      return search.toString();
    },
  },
});

/** Rút thông báo lỗi mà backend gửi kèm, xử lý cả dạng chuỗi lẫn mảng. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
    if (!error.response) return "Không kết nối được tới máy chủ";
  }
  return fallback;
}

/** Trạng thái HTTP, để giao diện phân biệt "sai mật khẩu" với "máy chủ hỏng". */
export const apiErrorStatus = (error: unknown): number | undefined =>
  error instanceof AxiosError ? error.response?.status : undefined;
