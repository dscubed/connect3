"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function Page() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
