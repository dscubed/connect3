"use client";
import { SignUpForm } from "@/components/auth/sign-up-form";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {loading ? <LoadingIndicator /> : <SignUpForm />}
        </div>
      </div>
      {user && !user.is_anonymous && !loading && (
        <AlreadyAuthenticatedDialog
          onboardingCompleted={profile?.onboarding_completed}
        />
      )}
    </>
  );
}
