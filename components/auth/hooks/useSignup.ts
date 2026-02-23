import { useState } from "react";
import { signUpWithEmail, signUpWithGoogle } from "@/lib/auth/signup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function useSignUp() {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  if (user && !user.is_anonymous) {
    toast.error("Already signed in!");
    return {
      isSigningUp: false,
      handleEmailSignUp: async (): Promise<{ error?: string }> => ({}),
      handleGoogleSignUp: async () => {},
    };
  }

  const handleEmailSignUp = async (params: {
    email: string;
    password: string;
    repeatPassword: string;
    firstName: string;
    lastName: string;
    accountType: "user" | "organisation";
  }): Promise<{ error?: string }> => {
    setIsSigningUp(true);

    if (params.password !== params.repeatPassword) {
      setIsSigningUp(false);
      return { error: "Passwords do not match" };
    }

    try {
      let anonymousId = null;
      if (user?.is_anonymous) {
        anonymousId = user.id;
        await useAuthStore.getState().signOut();
      }

      const { data, error } = await signUpWithEmail({
        ...params,
        anonymousId,
      });
      if (error) {
        setIsSigningUp(false);
        return { error: error.message || "An error occurred" };
      }
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setIsSigningUp(false);
        return { error: "Account already exists." };
      }
      if (data?.user?.email) {
        localStorage.setItem("pendingVerificationEmail", data.user.email);
      }
      router.push("/auth/sign-up-success");
      return {};
    } catch (error: unknown) {
      setIsSigningUp(false);
      return {
        error: error instanceof Error ? error.message : "An error occurred",
      };
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
