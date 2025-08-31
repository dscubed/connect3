"use client";
import { LoginForm } from "@/components/auth/login-form";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import AlreadyAuthenticatedDialog from "@/components/auth/AlreadyAuthenticatedDialog";

export default function Page() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => {
    if (user && !isLoggingIn) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [user, isLoggingIn]);
  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {loading ? (
            <LoadingIndicator />
          ) : (
            <LoginForm
              onLoggingInChange={setIsLoggingIn}
              isLoading={isLoggingIn}
            />
          )}
        </div>
      </div>
      {!isLoggingIn && <AlreadyAuthenticatedDialog open={showDialog} />}
    </>
  );
}
