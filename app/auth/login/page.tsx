"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/login-form";
import AuthLoadingSpinner from "@/components/ui/AuthLoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <AuthShell>
      {loading ? (
        <AuthLoadingSpinner fullPage={false} />
      ) : (
        <LoginForm
          onLoggingInChange={setIsLoggingIn}
          isLoading={isLoggingIn}
        />
      )}
    </AuthShell>
  );
}
