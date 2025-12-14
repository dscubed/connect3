"use client";

import { LoginForm } from "@/components/auth/login-form";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";
import { AuthShell } from "@/components/auth/AuthShell";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const busy = loading || isLoggingIn;

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

      {!busy && user && !user.is_anonymous && (
        <AlreadyAuthenticatedDialog
          onboardingCompleted={profile?.onboarding_completed}
        />
      )}
    </>
  );
}
