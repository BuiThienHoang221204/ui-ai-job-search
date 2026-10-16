import type { Metadata } from "next";
import { LoginView } from "./login-view";

export const metadata: Metadata = { title: "Đăng nhập — Careelot" };

export default function LoginPage() {
  return <LoginView />;
}
