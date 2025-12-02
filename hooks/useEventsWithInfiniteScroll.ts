import { HostedEvent } from "@/types/events/event";
import { RefObject, useCallback, useEffect } from "react";
import useSWRInfinite from "swr/infinite";

interface EventsResponse {
  events: HostedEvent[];
  cursor: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const getKey = (pageIndex: number, previousPageData: EventsResponse | null): string | null => {
  if (pageIndex === 0) {
    return process.env.NODE_ENV !== "production" ? 
      "http://localhost:3000/api/events?limit=10" : 
      "https://connect3.app/api/events?limit=10";
  }

  if (!previousPageData?.cursor ) return null;

  const encoded = encodeURIComponent(previousPageData.cursor);
  return process.env.NODE_ENV !== "production" ? 
    `http://localhost:3000/api/events?cursor=${encoded}&limit=10` : 
    `https://connect3.app/api/events?cursor=${encoded}&limit=10`;
}

/**
 * Hook to pull paginated event data from events table in Supabase
 * Creates an event listener to refetch data when events list is scrolled to base
 * @param eventListRef 
 * @returns 
 */
export function useEventsWithInfiniteScroll(eventListRef: RefObject<HTMLDivElement | null>) {
  const { data, 
        setSize, 
        error, 
        isValidating, 
        isLoading } = useSWRInfinite<EventsResponse>(getKey, fetcher);
            
  const events: HostedEvent[] = data ? data.flatMap(page => page.events) : [];
  const handleScroll = useCallback(() => {
    if (!eventListRef.current) {
      return;
    }

    const SCROLL_THRESHOLD = 5; // measured in pixels 
    const bottomPosition = Math.abs(eventListRef.current.scrollHeight - eventListRef.current.scrollTop);

    if (bottomPosition - eventListRef.current.clientHeight <= SCROLL_THRESHOLD && !isValidating) {
      // update once we scroll to the bottom and are not in the process of refetching / revalidating
      setSize(original => original + 1);
    }
  }, [eventListRef, setSize, isValidating]);

  // attach scroll event listener to event list once data loads
  useEffect(() => {
    if (isLoading) {
      return;
    }

    eventListRef.current?.addEventListener("scroll", handleScroll);
    const refCopy = eventListRef.current;
    return () => {
      if (refCopy) {
        refCopy.removeEventListener("scroll", handleScroll);
      }
    }
  }, [handleScroll, isLoading])

  return { events, error, isLoading, isValidating, setSize}
}