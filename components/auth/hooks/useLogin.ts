import { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth/login";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function useLogin(onLoggingInChange?: (loggingIn: boolean) => void) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const setLoggingState = (state: boolean) => {
    setIsLoggingIn(state);
    onLoggingInChange?.(state);
  };

  const handleEmailLogin = async (params: { email: string; password: string }) => {
    if (user) {
      toast.error("Already signed in!");
      return;
    }
    
    setLoggingState(true);
    try {
      const { error } = await loginWithEmail(params);
      if (error) throw error;
      router.push("/auth/callback");
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
      const { error } = await loginWithGoogle();
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google login failed");
      setLoggingState(false);
    }
  };

  return { isLoggingIn, handleEmailLogin, handleGoogleLogin };
}
