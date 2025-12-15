import { RefObject, useCallback, useEffect } from "react";
import useSWRInfinite from "swr/infinite";

interface PaginatedResponse<T> {
    items: T[];
    cursor: string | null;
}

/**
 * Hook to implement infinite scroll with a cursor paginated endpoint 
 * @param listRef ref to the scrollable div containing the data
 * @param endpoint api endpoint in the form "/api/your-endpoint"
 * @param limit how many items to load per revalidation
 */
export default function useInfiniteScroll<T>(listRef: RefObject<HTMLDivElement | null>, endpoint: string | null, limit?: number) {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const getKey = (pageIndex: number, previousPageData: PaginatedResponse<T> | null): string | null => {
        const baseUrl = process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "https://connect3.app";
        const setLimit = limit ?? 10;

        if (pageIndex === 0) {
            return `${baseUrl}${endpoint}?limit=${setLimit}`;
        }

        if (!previousPageData?.cursor) return null;

        const encoded = encodeURIComponent(previousPageData.cursor);
        return `${baseUrl}${endpoint}?cursor=${encoded}&limit=${setLimit}`;
    };

    const { data, 
        setSize, 
        error, 
        isValidating, 
        isLoading } = useSWRInfinite<PaginatedResponse<T>>(endpoint ? getKey : () => void fetcher);

    const items: T[] = data ? data.flatMap(d => d.items) : [];
    const handleScroll = useCallback(() => {
        if (!listRef.current) {
            return;
        }

        const SCROLL_THRESHOLD = 5; // measured in pixels
        const bottomPosition = Math.abs(listRef.current.scrollHeight - listRef.current.scrollTop);

        if (bottomPosition - listRef.current.clientHeight <= SCROLL_THRESHOLD && !isValidating) {
            // update once we scroll to the bottom and are not in the process of refetching / revalidating
            setSize(original => original + 1);
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
    }, [handleScroll, isLoading]);
    
    return { items, error, isLoading, isValidating, setSize}
}