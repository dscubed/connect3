import { EntityType } from "@/lib/search/types";
import { Profile } from "@/stores/authStore";
import { useProfile } from "@/lib/profiles/fetchProfile";

const ENTITY_CACHE_SELECT =
  "avatar_url, tldr, first_name, last_name, account_type";

export function useEntityCache(entityId: string, entityType: EntityType) {
  // Skip non-profile entity types
  const shouldFetch = entityType === "user" || entityType === "organisation";

  const { data: profile } = useProfile<Partial<Profile>>(
    shouldFetch ? entityId : null,
    ENTITY_CACHE_SELECT,
  );

  return profile;
}
