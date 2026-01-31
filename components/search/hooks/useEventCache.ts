import { useState, useEffect } from "react";
import { Event } from "@/lib/schemas/events/event";

const eventCache = new Map<string, Event>();

export function useEventCache(eventId: string | null) {
  const [event, setEvent] = useState<Event | undefined>(
    eventId ? eventCache.get(eventId) : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) return;
    if (eventCache.has(eventId)) {
      setEvent(eventCache.get(eventId));
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/events/${eventId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch event: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.event) {
          eventCache.set(eventId, data.event);
          setEvent(data.event);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch event"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return { event, isLoading, error };
}
