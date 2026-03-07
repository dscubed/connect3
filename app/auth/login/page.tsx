"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/login-form";
import AuthLoadingSpinner from "@/components/ui/AuthLoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

function LoginContent() {
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") ?? undefined;

  return (
    <AuthShell>
      {loading ? (
        <AuthLoadingSpinner fullPage={false} />
      ) : (
        <LoginForm
          onLoggingInChange={setIsLoggingIn}
          isLoading={isLoggingIn}
          redirectTo={redirectTo}
        />
      )}
    </AuthShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingSpinner fullPage={false} />}>
      <LoginContent />
    </Suspense>
  );
}
