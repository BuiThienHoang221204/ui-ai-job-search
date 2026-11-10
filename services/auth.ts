import { api } from "@/lib/axios";
import type { AuthResult, AuthUser, VerificationRequired } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    api
      .post<AuthResult | VerificationRequired>("/auth/login", {
        email,
        password,
      })
      .then((r) => r.data),

  register: (email: string, password: string, name: string, ref?: string) =>
    api
      .post<VerificationRequired>("/auth/register", {
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

  verifyCode: (email: string, code: string) =>
    api
      .post<AuthResult>("/auth/verify-code", { email, code })
      .then((r) => r.data),

  resendCode: (email: string) =>
    api.post<{ ok: true }>("/auth/resend-code", { email }).then((r) => r.data),

  /** Lấy thông tin người dùng hiện tại, vai trò đọc tươi từ database. */
  me: () => api.get<AuthUser>("/auth/me").then((r) => r.data),
};
