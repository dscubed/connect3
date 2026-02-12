import useSWR from "swr";
import { Event } from "@/lib/schemas/events/event";

export function useEventCache(eventId: string | null) {
  const swrKey = eventId ? `/api/events/${eventId}` : null;

  const { data, error, isLoading } = useSWR<{ event: Event }>(
    swrKey,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch event: ${res.status}`);
      }
      return res.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  return { event: data?.event, isLoading, error };
}
