"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { OrgSignUpForm } from "@/components/auth/org-sign-up-form";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const loading = useAuthStore((state) => state.loading);

  return (
    <AuthShell>{loading ? <LoadingIndicator /> : <OrgSignUpForm />}</AuthShell>
  );
}
