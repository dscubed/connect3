"use client";

import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import AuthLoadingSpinner from "@/components/ui/AuthLoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { useSearchParams } from "next/navigation";

function SignUpContent() {
  const loading = useAuthStore((state) => state.loading);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      {loading ? (
        <AuthLoadingSpinner fullPage={false} />
      ) : (
        <SignUpForm
          initialError={
            error === "university_email_required"
              ? "Sign-up is limited to university email addresses from University of Melbourne, UWA, Monash, or RMIT. Please use your university email."
              : undefined
          }
        />
      )}
    </>
  );
}

export default function Page() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthLoadingSpinner fullPage={false} />}>
        <SignUpContent />
      </Suspense>
    </AuthShell>
  );
}
