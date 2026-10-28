import { api } from "@/lib/axios";
import type { AuthResult, AuthUser } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    api
      .post<AuthResult>("/auth/login", { email, password })
      .then((r) => r.data),

  register: (email: string, password: string, name: string, ref?: string) =>
    api
      .post<AuthResult>("/auth/register", {
        email,
        password,
        name,
        ref,
        acceptTerms: true,
      })
      .then((r) => r.data),

  googleLogin: (idToken: string, ref?: string) =>
    api
      .post<AuthResult>("/auth/google", { idToken, ref, acceptTerms: true })
      .then((r) => r.data),

  logout: () => api.post<{ ok: true }>("/auth/logout").then((r) => r.data),

  deleteAccount: () =>
    api.delete<{ ok: true }>("/auth/account").then((r) => r.data),

  /** Lấy thông tin người dùng hiện tại, vai trò đọc tươi từ database. */
  me: () => api.get<AuthUser>("/auth/me").then((r) => r.data),
};
