"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const loading = useAuthStore((state) => state.loading);

  return (
    <AuthShell>{loading ? <LoadingIndicator /> : <SignUpForm />}</AuthShell>
  );
}
