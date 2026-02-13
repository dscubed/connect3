import useSWR from "swr";
import { EntityType } from "@/lib/search/types";
import { Profile, useAuthStore } from "@/stores/authStore";

export function useEntityCache(entityId: string, entityType: EntityType) {
  const { getSupabaseClient } = useAuthStore();

  // Skip non-profile entity types
  const shouldFetch = entityType === "user" || entityType === "organisation";
  const swrKey = shouldFetch ? `profile_${entityId}` : null;

  const { data: profile } = useSWR<Partial<Profile>>(
    swrKey,
    async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, tldr, first_name, last_name, account_type")
        .eq("id", entityId)
        .single();

      if (error) {
        console.error("useEntityCache error:", error);
        throw error;
      }

      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  return profile;
}
