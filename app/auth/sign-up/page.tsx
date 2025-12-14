"use client";

import { SignUpForm } from "@/components/auth/sign-up-form";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";
import { AuthShell } from "@/components/auth/AuthShell";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);

  return (
    <>
      <AuthShell>
        {loading ? <LoadingIndicator /> : <SignUpForm />}
      </AuthShell>

      {user && !user.is_anonymous && !loading && (
        <AlreadyAuthenticatedDialog
          onboardingCompleted={profile?.onboarding_completed}
        />
      )}
    </>
  );
}
