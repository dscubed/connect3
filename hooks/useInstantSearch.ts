import { useEffect, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import type { InstantSearchResult } from "@/app/api/instant-search/route";

export type { InstantSearchResult };

export function useInstantSearch(rawQuery: string) {
  const debouncedQuery = useDebouncedValue(rawQuery, 150);
  const [results, setResults] = useState<InstantSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/instant-search?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResults(data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const clear = () => setResults([]);

  return { results, isLoading, clear };
}
