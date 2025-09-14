interface RateLimitOptions {
  interval: number;
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

export function rateLimit({ interval }: RateLimitOptions) {
  const tokenCache = new Map<string, RateLimitState>();

  return {
    check: async (limit: number, token: string) => {
      const now = Date.now();
      const tokenState = tokenCache.get(token);

      if (!tokenState || now > tokenState.resetTime) {
        tokenCache.set(token, {
          count: 1,
          resetTime: now + interval,
        });
        return;
      }

      if (tokenState.count >= limit) {
        throw new Error("Rate limit exceeded");
      }

      tokenState.count++;
    },
  };
}
