import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";

interface PaginatedResponse<T> {
  items: T[];
  cursor: string | null;
}

interface UseInfiniteScrollOptions {
  limit?: number;
  /** Additional query params to append to the URL */
  queryParams?: Record<string, string>;
  /** Root margin for Intersection Observer - load more when sentinel is this far from viewport (default: 200px) */
  rootMargin?: string;
}

/**
 * Hook to implement infinite scroll with a cursor paginated endpoint.
 * Uses Intersection Observer for reliable, performant scroll detection.
 * @param endpoint api endpoint in the form "/api/your-endpoint"
 * @param options optional config: limit, queryParams, rootMargin
 * @returns items, sentinelRef (attach to a div at the bottom of your list), and other fields
 */
export default function useInfiniteScroll<T>(
  listRef: RefObject<HTMLDivElement | null>,
  endpoint: string | null,
  options?: UseInfiniteScrollOptions
) {
  const { limit, queryParams, rootMargin = "200px" } = options ?? {};
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const getKey = (
    pageIndex: number,
    previousPageData: PaginatedResponse<T> | null
  ): string | null => {
    if (!endpoint) return null;

    const baseUrl =
      process.env.NODE_ENV !== "production"
        ? "http://localhost:3000"
        : "https://connect3.app";
    const setLimit = limit ?? 10;

    const params = new URLSearchParams();
    params.set("limit", setLimit.toString());

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.set(key, value);
        }
      });
    }

    if (pageIndex === 0) {
      return `${baseUrl}${endpoint}?${params.toString()}`;
    }

    if (!previousPageData?.cursor) return null;

    params.set("cursor", previousPageData.cursor);
    return `${baseUrl}${endpoint}?${params.toString()}`;
  };

  const { data, setSize, mutate, error, isValidating, isLoading } =
    useSWRInfinite<PaginatedResponse<T>>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });

  const rawItems: T[] = !!data ? data.flatMap((d) => d.items) : [];
  const items: T[] = rawItems.filter((item, index, arr) => {
    const id = (item as { id?: string }).id;
    if (id == null || id === "") return true;
    const firstIndex = arr.findIndex((i) => (i as { id?: string }).id === id);
    return firstIndex === index;
  });

  const lastPage = data?.at(-1);
  const hasMore = !!lastPage?.cursor;

  const loadMore = useCallback(() => {
    if (isValidating || isLoadingMoreRef.current || !hasMore) return;
    isLoadingMoreRef.current = true;
    setSize((s) => s + 1);
  }, [setSize, isValidating, hasMore]);

  useEffect(() => {
    isLoadingMoreRef.current = false;
  }, [data]);

  useEffect(() => {
    if (isLoading || !hasMore) return;

    const sentinel = sentinelRef.current;
    const scrollRoot = listRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      {
        root: scrollRoot ?? null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, listRef]);

  return {
    items,
    error,
    isLoading,
    isValidating,
    hasMore,
    sentinelRef,
    setSize,
    mutate,
  };
}
