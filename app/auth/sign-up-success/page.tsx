"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/auth/signup";
import { toast } from "sonner";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("pendingVerificationEmail");
    if (email) {
      setPendingEmail(email);
    }
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
        router.replace("/profile");
      }
    }
  }, [user, profile, router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {loading && user ? (
          <LoadingIndicator />
        ) : (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Thank you for signing up!
                </CardTitle>
                <CardDescription>Check your email to confirm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve successfully signed up. Please check your email
                    to confirm your account before signing in.
                  </p>

                  <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={isResending || !pendingEmail}
                    className={`w-full ${
                      !pendingEmail || isResending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isResending
                      ? "Sending..."
                      : !pendingEmail
                      ? "Unable to Resend"
                      : "Resend Confirmation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
