import { useState, useEffect } from "react";
import { EntityType } from "@/lib/search/type";
import { Profile, useAuthStore } from "@/stores/authStore";

// Global cache shared across all hook calls
const entityAvatarMap = new Map<string, Partial<Profile> | undefined>();

export function useEntityCache(entityId: string, entityType: EntityType) {
  const { getSupabaseClient } = useAuthStore();
  const [profile, setProfile] = useState<Partial<Profile> | undefined>(
    entityAvatarMap.get(`${entityType}:${entityId}`)
  );

  // Fetch and cache avatar
  useEffect(() => {
    const key = `${entityType}_${entityId}`;
    if (entityAvatarMap.has(key)) {
      setProfile(entityAvatarMap.get(key));
      return;
    }
    let cancelled = false;
    (async () => {
      let profile: Partial<Profile> | undefined = undefined;
      if (entityType === "user" || entityType === "organisation") {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, tldr, status, location, first_name, last_name")
          .eq("id", entityId)
          .single();
        if (!error && data?.avatar_url) {
          profile = data;
        }
      }
      entityAvatarMap.set(key, profile);
      if (!cancelled) setProfile(profile);
    })();
    return () => {
      cancelled = true;
    };
  }, [entityId, entityType, getSupabaseClient]);

  return profile;
}
