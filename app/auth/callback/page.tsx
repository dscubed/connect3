"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let attempts = 0;
    const maxAttempts = 10;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Got user, check onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.replace("/");
        } else {
          router.replace("/onboarding");
        }
        return true;
      }
      return false;
    };

    const pollForAuth = async () => {
      const hasAuth = await checkAuth();
      
      if (!hasAuth && attempts < maxAttempts) {
        attempts++;
        setTimeout(pollForAuth, 500);
      } else if (!hasAuth) {
        // Give up after 5 seconds
        router.replace("/auth/login");
      }
    };

    pollForAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}