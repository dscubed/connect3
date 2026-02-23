"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import AuthLoadingSpinner from "@/components/ui/AuthLoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const loading = useAuthStore((state) => state.loading);

  return (
    <AuthShell>{loading ? <AuthLoadingSpinner fullPage={false} /> : <SignUpForm />}</AuthShell>
  );
}
