"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  return (
    <>
      <AuthShell>{loading ? <LoadingIndicator /> : <SignUpForm />}</AuthShell>

      {user && !user.is_anonymous && !loading && (
        <AlreadyAuthenticatedDialog />
      )}
    </>
  );
}
