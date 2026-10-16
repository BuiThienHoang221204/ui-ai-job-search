import type { Metadata } from "next";
import { RegisterView } from "./register-view";

export const metadata: Metadata = { title: "Đăng ký — Careelot" };

export default function RegisterPage() {
  return <RegisterView />;
}
