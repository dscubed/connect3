"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/login-form";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
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
  );
}
