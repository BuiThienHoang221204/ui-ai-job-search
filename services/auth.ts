import type { AuthUser } from "@/types";
import { api } from "@/lib/axios";
import type { AuthResult } from "./types";

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResult>("/auth/login", { email, password }).then((r) => r.data),

  register: (email: string, password: string, name: string) =>
    api
      .post<AuthResult>("/auth/register", { email, password, name })
      .then((r) => r.data),

  logout: () => api.post<{ ok: true }>("/auth/logout").then((r) => r.data),

  /** Lấy thông tin người dùng hiện tại, vai trò đọc tươi từ database. */
  me: () => api.get<AuthUser>("/auth/me").then((r) => r.data),
};
