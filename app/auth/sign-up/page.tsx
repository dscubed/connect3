"use client";
import { SignUpForm } from "@/components/auth/sign-up-form";
import LoadingIndicator from "@/components/ui/LoadingSpinner";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => {
    if (user && !isSigningUp) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [user, isSigningUp]);
  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {loading || isSigningUp ? (
            <LoadingIndicator />
          ) : (
            <SignUpForm
              onSigningUpChange={setIsSigningUp}
              isSigningUp={isSigningUp}
            />
          )}
        </div>
      </div>
      {!isSigningUp && <AlreadyAuthenticatedDialog open={showDialog} />}
    </>
  );
}
