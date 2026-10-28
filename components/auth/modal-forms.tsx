"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useLoginModal } from "@/hooks/use-login-modal";
import { ReferralNotice } from "./referral-notice";

const LoginForm = dynamic(() =>
  import("@/components/auth/login-form").then((m) => m.LoginForm),
);
const RegisterForm = dynamic(() =>
  import("@/components/auth/register-form").then((m) => m.RegisterForm),
);

/** Form trong modal; đọc mã mời `?ref` của link chia sẻ nên phải nằm trong Suspense. */
export function ModalForms({ onSuccess }: { onSuccess: () => void }) {
  const { mode, setMode } = useLoginModal();
  const referral = useSearchParams().get("ref") ?? undefined;

  if (mode === "login") return <LoginForm onSuccess={onSuccess} />;
  return (
    <div className="space-y-3">
      {referral && <ReferralNotice />}
      <RegisterForm
        onSuccess={onSuccess}
        onLoginInstead={() => setMode("login")}
        referral={referral}
      />
    </div>
  );
}
