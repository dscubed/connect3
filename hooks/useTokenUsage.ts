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
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);

  const { data, isLoading } = useSWR<TokenUsageData>(
    "/api/token-usage",
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
    isLoading,
  };
}
