"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/login-form";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <>
      <AuthShell>
        {loading ? (
          <LoadingIndicator />
        ) : (
          <LoginForm
            onLoggingInChange={setIsLoggingIn}
            isLoading={isLoggingIn}
          />
        )}
      </AuthShell>

      {!isLoggingIn && user && !user.is_anonymous && (
        <AlreadyAuthenticatedDialog
          onboardingCompleted={profile?.onboarding_completed}
        />
      )}
    </>
  );
}
