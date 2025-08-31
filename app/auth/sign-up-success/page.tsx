"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
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
        router.replace("/onboarding");
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
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to
                  confirm your account before signing in.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
