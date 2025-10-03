import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/components/search/types";

interface UserProfilesState {
  profiles: Map<string, UserProfile>;
  loading: boolean;
  error: string | null;
}

export function useUserProfiles(userIds: string[]) {
  const [state, setState] = useState<UserProfilesState>({
    profiles: new Map(),
    loading: false,
    error: null,
  });

  const fetchUserProfiles = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setState({ profiles: new Map(), loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const supabase = createClient();

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, status, location, tldr")
        .in("id", ids);

      if (error) {
        console.error("❌ Error fetching user profiles:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch user profiles",
        }));
        return;
      }

      const profileMap = new Map<string, UserProfile>();

      profiles?.forEach((profile) => {
        profileMap.set(profile.id, {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name || ""}`,
          status: profile.status,
          location: profile.location,
          tldr: profile.tldr,
          avatar_url:
            profile.avatar_url ||
            process.env.NEXT_PUBLIC_PLACEHOLDER_AVATAR_URL,
        });
      });

      console.log("✅ Fetched user profiles:", profileMap);

      setState((prev) => ({
        ...prev,
        profiles: profileMap,
        loading: false,
      }));
    } catch (error) {
      console.error("❌ Error in useUserProfiles:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "An unexpected error occurred",
      }));
    }
  }, []);

  useEffect(() => {
    fetchUserProfiles(userIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds.join(","), fetchUserProfiles]);

  return state;
}
