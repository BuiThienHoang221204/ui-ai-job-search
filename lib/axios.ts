import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

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

/** Route KHÔNG thử lại sau 401: /auth/refresh tránh tự gọi lại vô tận, hai route kia 401 là câu trả lời ĐÚNG (sai mật khẩu) chứ không phải token hết hạn. */
const NO_RETRY = ["/auth/refresh", "/auth/login", "/auth/register"];

/** Lời refresh đang bay, dùng chung cho mọi request 401 cùng lúc - không gộp thì một trang bắn 6 request thì cả 6 cùng gọi /auth/refresh. */
let refreshing: Promise<void> | null = null;

const refreshOnce = (): Promise<void> => {
  refreshing ??= api
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Access hết hạn thì đổi lấy cái mới rồi chạy lại request, thay vì đá người dùng về đăng nhập giữa chừng. Chỉ thử lại MỘT lần (`_retried`) - refresh xong vẫn 401 nghĩa là phiên đã chết thật. */
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) throw error;

    const config = error.config as RetriableConfig | undefined;
    const url = config?.url ?? "";
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      NO_RETRY.some((path) => url.startsWith(path))
    ) {
      throw error;
    }

    config._retried = true;
    try {
      await refreshOnce();
    } catch {
      // Refresh cũng hỏng: phiên đã hết thật. Ném lỗi 401 GỐC ra ngoài để chỗ gọi xử lý như trước (vd SessionProvider đá về /login).
      throw error;
    }
    return api(config);
  },
);

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
