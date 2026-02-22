import useSWR from "swr";
import { useAuthStore } from "@/stores/authStore";
import { getFingerprint } from "@/hooks/useFingerprint";

interface TokenUsageData {
  tokensUsed: number;
  maxTokens: number;
  remaining: number;
  resetsAt: string;
  tier: "anon" | "verified";
}

export function useTokenUsage() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);

  // Wait for auth store to initialize before fetching so we send the right identity
  const key = loading ? null : "/api/token-usage";

  const { data, isLoading } = useSWR<TokenUsageData>(
    key,
    async (url: string) => {
      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const fp = getFingerprint();
      if (fp) {
        headers["X-Fingerprint"] = fp;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch token usage");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
    },
  );

  const percentUsed = data ? (data.tokensUsed / data.maxTokens) * 100 : 0;

  return {
    tokensUsed: data?.tokensUsed ?? 0,
    maxTokens: data?.maxTokens ?? 0,
    remaining: data?.remaining ?? 0,
    percentUsed,
    resetsAt: data?.resetsAt ?? null,
    tier: data?.tier ?? null,
    isLoading: isLoading || loading,
  };
}
