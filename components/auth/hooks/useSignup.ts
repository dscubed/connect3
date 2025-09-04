import { useState } from "react";
import { signUpWithEmail, signUpWithGoogle } from "@/lib/auth/signup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function useSignUp() {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  if (user) {
    toast.error("Already signed in!");
    return {
      isSigningUp: false,
      handleEmailSignUp: async () => {},
      handleGoogleSignUp: async () => {}
    };
  }

  const handleEmailSignUp = async (params: {
    email: string;
    password: string;
    repeatPassword: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsSigningUp(true);
    if (params.password !== params.repeatPassword) {
      toast.error("Passwords do not match");
      setIsSigningUp(false);
      return;
    }
    try {
      const { data, error } = await signUpWithEmail(params);
      if (error) {
        toast.error(error.message || "An error occurred");
        setIsSigningUp(false);
        return;
      }
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        toast.error("Account already exists.");
        setIsSigningUp(false);
        return;
      }
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSigningUp(true);
    try {
      const { error } = await signUpWithGoogle();
      if (error) throw error;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSigningUp(false);
    }
  };

  return { isSigningUp, handleEmailSignUp, handleGoogleSignUp };
}
