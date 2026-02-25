import useSWR from "swr";

// ─── Types ──────────────────────────────────────────────────────

/** Allowed source tables/views */
export type ProfileTable = "profiles" | "profile_detail";

interface FetchProfileOptions {
  /** Comma-separated columns, e.g. "avatar_url, account_type". Defaults to "*" */
  select?: string;
  /** "profiles" (default, lightweight) or "profile_detail" (includes links & chunks) */
  table?: ProfileTable;
}

// ─── Core fetch function ────────────────────────────────────────

/**
 * Fetches a single profile by ID via the server-side API route.
 * Works in both client and server components.
 *
 * @example
 * // Lightweight fetch (default — profiles table)
 * const profile = await fetchProfile(userId);
 *
 * @example
 * // Specific columns only
 * const data = await fetchProfile<{ avatar_url: string }>(userId, { select: "avatar_url" });
 *
 * @example
 * // Full profile with links & chunks (profile_detail view)
 * const detail = await fetchProfile<ProfileDetail>(userId, { table: "profile_detail" });
 */
export async function fetchProfile<T = Record<string, unknown>>(
  id: string,
  options?: FetchProfileOptions,
): Promise<T | null> {
  const params = new URLSearchParams({ id });
  if (options?.select) params.set("select", options.select);
  if (options?.table) params.set("table", options.table);

  const res = await fetch(`/api/profiles/fetch?${params.toString()}`);
  if (!res.ok) {
    console.error(`fetchProfile error (${res.status}):`, await res.text());
    return null;
  }

  const json = await res.json();
  return json.data as T;
}

/**
 * Fetches multiple profiles by IDs via the server-side API route.
 */
export async function fetchProfiles<T = Record<string, unknown>>(
  ids: string[],
  options?: FetchProfileOptions,
): Promise<T[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({ ids: ids.join(",") });
  if (options?.select) params.set("select", options.select);
  if (options?.table) params.set("table", options.table);

  const res = await fetch(`/api/profiles/fetch?${params.toString()}`);
  if (!res.ok) {
    console.error(`fetchProfiles error (${res.status}):`, await res.text());
    return [];
  }

  const json = await res.json();
  return json.data as T[];
}

// ─── Search profiles ────────────────────────────────────────────

interface SearchProfilesOptions extends FetchProfileOptions {
  /** Filter by equality, e.g. { account_type: "organisation" } */
  filter?: Record<string, string>;
  /** Exclude a specific ID (e.g. current user) */
  excludeId?: string;
  /** Max results (default 10) */
  limit?: number;
}

/**
 * Searches profiles by first_name (ilike) via the server-side API route.
 */
export async function searchProfiles<T = Record<string, unknown>>(
  search: string,
  options?: SearchProfilesOptions,
): Promise<T[]> {
  const params = new URLSearchParams({ search });
  if (options?.select) params.set("select", options.select);
  if (options?.table) params.set("table", options.table);
  if (options?.filter) params.set("filter", JSON.stringify(options.filter));
  if (options?.excludeId) params.set("excludeId", options.excludeId);
  if (options?.limit) params.set("limit", String(options.limit));

  const res = await fetch(`/api/profiles/fetch?${params.toString()}`);
  if (!res.ok) {
    console.error(`searchProfiles error (${res.status}):`, await res.text());
    return [];
  }

  const json = await res.json();
  return json.data as T[];
}

// ─── SWR hooks ──────────────────────────────────────────────────

interface UseProfileOptions {
  /** Comma-separated columns e.g. "avatar_url, account_type" */
  select?: string;
  /** "profiles" (default) or "profile_detail" (includes links & chunks) */
  table?: ProfileTable;
}

/**
 * SWR hook for fetching a single profile.
 * Handles deduplication and caching automatically.
 *
 * @param id       Profile ID (pass null/undefined to skip fetching)
 * @param options  { select?, table? }
 *
 * @example
 * // Lightweight profile
 * const { data } = useProfile(userId);
 *
 * @example
 * // Specific columns
 * const { data } = useProfile(userId, { select: "avatar_url, account_type" });
 *
 * @example
 * // Full profile detail view
 * const { data } = useProfile(userId, { table: "profile_detail" });
 */
export function useProfile<T = Record<string, unknown>>(
  id: string | null | undefined,
  options?: UseProfileOptions | string,
) {
  // Backwards-compatible: accept a plain string as the select parameter
  const resolvedOptions: UseProfileOptions | undefined =
    typeof options === "string" ? { select: options } : options;

  const table = resolvedOptions?.table ?? "profiles";
  const select = resolvedOptions?.select;

  // The SWR key encodes id, table, and select so different combos don't collide
  const swrKey = id ? `profile:${table}:${id}:${select ?? "*"}` : null;

  return useSWR<T | null>(
    swrKey,
    async () => {
      if (!id) return null;
      return fetchProfile<T>(id, { select, table });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60_000, // 1 minute dedup window
    },
  );
}
