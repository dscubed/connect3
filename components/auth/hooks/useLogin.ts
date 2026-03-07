import { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth/login";
import { isAllowedRedirect } from "@/lib/auth/sso";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function useLogin(
  onLoggingInChange?: (loggingIn: boolean) => void,
  redirectTo?: string,
) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const setLoggingState = (state: boolean) => {
    setIsLoggingIn(state);
    onLoggingInChange?.(state);
  };

  const handleEmailLogin = async (params: {
    email: string;
    password: string;
  }) => {
    if (user?.is_anonymous) {
      await useAuthStore.getState().signOut();
    } else if (user) {
      toast.error("Already signed in!");
      return;
    }

    setLoggingState(true);
    try {
      const { error } = await loginWithEmail(params);
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (
          msg.includes("email not confirmed") ||
          msg.includes("email not verified") ||
          msg.includes("confirm your email")
        ) {
          localStorage.setItem("pendingVerificationEmail", params.email);
          router.push("/auth/sign-up-success");
          setLoggingState(false);
          return;
        }
        throw error;
      }
      if (redirectTo && isAllowedRedirect(redirectTo)) {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const target = new URL(redirectTo);
          target.searchParams.set("access_token", session.access_token);
          target.searchParams.set("refresh_token", session.refresh_token);
          window.location.href = `/auth/sso/redirect?target=${encodeURIComponent(target.toString())}`;
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      setLoggingState(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (user) {
      toast.error("Already signed in!");
      return;
    }

    setLoggingState(true);
    try {
      const { error } = await loginWithGoogle(redirectTo);
      if (error) throw error;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google login failed",
      );
      setLoggingState(false);
    }
  };

  return { isLoggingIn, handleEmailLogin, handleGoogleLogin };
}
