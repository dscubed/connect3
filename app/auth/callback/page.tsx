"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let attempts = 0;
    const maxAttempts = 10;

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // migration check
        if (session.user.user_metadata.anonymousId) {
          console.log("Migrating anonymous data for user: ", session.user);
          toast.info("Migrating existing chats to your new account...");
          try {
            const { data, error } = await supabase.rpc(
              "migrate_anonymous_user_data",
              {
                old_anonymous_id: session.user.user_metadata.anonymousId,
                new_user_id: session.user.id,
              },
            );
            if (error) {
              toast.error("Failed to migrate anonymous data");
              console.error(error);
            } else {
              toast.success("Anonymous data migrated successfully");
              // clear anonymous metadata
              await supabase.auth.updateUser({
                data: {
                  anonymousId: null,
                },
              });
              console.log(data);
            }
          } catch (error) {
            toast.error("Failed to migrate anonymous data");
            console.error(error);
          }
        }

        // Got user, check onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.replace("/");
        } else {
          router.replace("/profile");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
