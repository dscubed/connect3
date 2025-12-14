// app/auth/login/page.tsx
"use client";

import { LoginForm } from "@/components/auth/login-form";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";
import { AuthCharacters } from "@/components/auth/AuthCharacters";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const busy = loading || isLoggingIn;

  return (
    <>
      <main className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-[#f0e5ff] via-[#f7e9ff] to-[#ffd6e0] px-4 py-8 md:px-8 md:py-12">
        <div className="w-full max-w-6xl">
          <div className="rounded-[32px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)] px-6 py-8 md:px-12 md:py-10">
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
              {/* left: form */}
              <div className="w-full max-w-md">
                {loading ? (
                  <LoadingIndicator />
                ) : (
                  <LoginForm
                    onLoggingInChange={setIsLoggingIn}
                    isLoading={isLoggingIn}
                  />
                )}
              </div>

              {/* right: characters */}
              <div className="mt-8 hidden flex-1 justify-center md:flex">
                <AuthCharacters />
              </div>
            </div>
          </div>
        </div>
      </main>

      {!busy && user && !user.is_anonymous && (
        <AlreadyAuthenticatedDialog
          onboardingCompleted={profile?.onboarding_completed}
        />
      )}
    </>
  );
}
