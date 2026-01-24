import { useState, useEffect } from "react";
import { EntityType } from "@/lib/search/types";
import { Profile, useAuthStore } from "@/stores/authStore";

// Global cache shared across all hook calls - only stores successful fetches
const entityCache = new Map<string, Partial<Profile>>();

export function useEntityCache(entityId: string, entityType: EntityType) {
  const { getSupabaseClient } = useAuthStore();
  const key = `${entityType}_${entityId}`;
  const [profile, setProfile] = useState<Partial<Profile> | undefined>(
    entityCache.get(key),
  );

  useEffect(() => {
    // If already cached, use it
    const cached = entityCache.get(key);
    if (cached) {
      setProfile(cached);
      return;
    }

    // Skip non-profile entity types
    if (entityType !== "user" && entityType !== "organisation") {
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, tldr, first_name, last_name, account_type")
          .eq("id", entityId)
          .single();

        if (error) {
          console.error("useEntityCache error:", error);
          return;
        }

        if (data && !cancelled) {
          entityCache.set(key, data);
          setProfile(data);
        }
      } catch (err) {
        console.error("useEntityCache exception:", err);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [entityId, entityType, getSupabaseClient, key]);

  return profile;
}
