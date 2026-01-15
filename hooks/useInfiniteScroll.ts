import { RefObject, useCallback, useEffect } from "react";
import useSWRInfinite from "swr/infinite";

interface PaginatedResponse<T> {
  items: T[];
  cursor: string | null;
}

interface UseInfiniteScrollOptions {
  limit?: number;
  /** Additional query params to append to the URL */
  queryParams?: Record<string, string>;
}

/**
 * Hook to implement infinite scroll with a cursor paginated endpoint
 * @param listRef ref to the scrollable div containing the data
 * @param endpoint api endpoint in the form "/api/your-endpoint"
 * @param options optional config: limit, queryParams
 */
export default function useInfiniteScroll<T>(
  listRef: RefObject<HTMLDivElement | null>,
  endpoint: string | null,
  options?: UseInfiniteScrollOptions
) {
  const { limit, queryParams } = options ?? {};
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

    // Build query string with additional params
    const params = new URLSearchParams();
    params.set("limit", setLimit.toString());

    // Add any additional query params
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
    useSWRInfinite<PaginatedResponse<T>>(getKey, fetcher);

  const items: T[] = !!data ? data.flatMap((d) => d.items) : [];
  const handleScroll = useCallback(() => {
    if (!listRef.current) {
      return;
    }

    const SCROLL_THRESHOLD = 5; // measured in pixels
    const bottomPosition = Math.abs(
      listRef.current.scrollHeight - listRef.current.scrollTop
    );

    if (
      bottomPosition - listRef.current.clientHeight <= SCROLL_THRESHOLD &&
      !isValidating
    ) {
      // update once we scroll to the bottom and are not in the process of refetching / revalidating
      setSize((original) => original + 1);
    }
  }, [listRef, setSize, isValidating]);

  // attach scroll event listener to list once data loads
  useEffect(() => {
    if (isLoading) {
      return;
    }

    listRef.current?.addEventListener("scroll", handleScroll);
    const refCopy = listRef.current;
    return () => {
      if (refCopy) {
        refCopy.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll, isLoading, listRef]);

  return { items, error, isLoading, isValidating, setSize, mutate };
}
