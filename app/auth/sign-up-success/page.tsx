"use client";

import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/auth/signup";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { cn } from "@/lib/utils";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();

  const [isResending, setIsResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("pendingVerificationEmail");
    if (email) setPendingEmail(email);
  }, []);

  const handleResendVerification = async () => {
    if (!pendingEmail) return;

    setIsResending(true);
    try {
      const { error } = await resendVerificationEmail(pendingEmail);
      if (error) {
        toast.error(error.message || "Failed to resend verification email");
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    } catch (error) {
      toast.error("An error occurred while resending verification email");
      console.error("Resend verification error:", error);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      if (!user) {
        router.replace("/auth/login");
      }

      if (
        (user.email_confirmed_at || user.confirmed_at) &&
        profile.onboarding_completed
      ) {
        router.replace("/");
      } else if (
        (user.email_confirmed_at || user.confirmed_at) &&
        !profile.onboarding_completed
      ) {
        localStorage.removeItem("pendingVerificationEmail");
        router.replace("/onboarding");
      }
    }
  }, [user, profile, router]);

  return (
    <AuthShell>
      {loading && user ? (
        <LoadingIndicator />
      ) : (
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-black">
              Thank you for signing up!
            </h1>
            <p className="text-sm text-black/70">Check your email to confirm</p>
          </div>

          <p className="text-sm text-black/70 leading-relaxed">
            You&apos;ve successfully signed up. Please check your email to
            confirm your account before signing in.
          </p>

          <Button
            variant="outline"
            onClick={handleResendVerification}
            disabled={isResending || !pendingEmail}
            className={cn(
              "h-12 w-full rounded-full border-2",
              "border-black/10 bg-white text-black",
              "hover:bg-black/5",
              (!pendingEmail || isResending) && "opacity-60 cursor-not-allowed"
            )}
          >
            {isResending
              ? "Sending..."
              : !pendingEmail
              ? "Unable to Resend"
              : "Resend Confirmation"}
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
