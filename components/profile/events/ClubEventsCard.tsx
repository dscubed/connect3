"use client";

import useSWR, { useSWRConfig } from "swr";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProfileContext } from "@/components/profile/ProfileProvider";
import { useAuthStore } from "@/stores/authStore";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { EventGridCard } from "@/components/events/EventGridCard";
import type { Event } from "@/lib/schemas/events/event";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const TICKETING_URL =
  process.env.NEXT_PUBLIC_TICKETING_URL ?? "https://tix.connect3.app";

type RawEvent = {
  id: string;
  name?: string | null;
  start?: string | null;
  end?: string | null;
  description?: string | null;
  is_online?: boolean | null;
  thumbnail?: string | null;
  created_at?: string | null;
  category?: string | null;
  status?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function rawEventToEvent(raw: RawEvent, creatorProfileId: string): Event {
  return {
    id: raw.id,
    name: raw.name || "Untitled event",
    creatorProfileId,
    description: raw.description || undefined,
    start: raw.start || new Date().toISOString(),
    end: raw.end || undefined,
    publishedAt: raw.created_at || new Date().toISOString(),
    isOnline: raw.is_online ?? false,
    thumbnail: raw.thumbnail || undefined,
    category: raw.category || undefined,
    location: { venue: "TBA", address: "", latitude: 0, longitude: 0 },
    pricing: { min: 0, max: 0 },
  };
}

const sortEvents = (events: RawEvent[]) => {
  const now = Date.now();
  const upcoming = events
    .filter((e) => {
      if (!e.start) return false;
      const t = new Date(e.start).getTime();
      return !Number.isNaN(t) && t >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.start ?? 0).getTime() - new Date(b.start ?? 0).getTime(),
    );
  const past = events
    .filter((e) => {
      if (!e.start) return false;
      const t = new Date(e.start).getTime();
      return !Number.isNaN(t) && t < now;
    })
    .sort(
      (a, b) =>
        new Date(b.start ?? 0).getTime() - new Date(a.start ?? 0).getTime(),
    );
  return [...upcoming, ...past];
};

type PanelState = { event: Event } | null;

export default function ClubEventsCard({ profileId }: { profileId: string }) {
  const { profile, isOwnProfile } = useProfileContext();
  const canManageEvents =
    isOwnProfile && profile?.account_type === "organisation";
  const { makeAuthenticatedRequest } = useAuthStore();
  const { mutate } = useSWRConfig();

  const [panel, setPanel] = useState<PanelState>(null);
  const [showAll, setShowAll] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const { data, isLoading } = useSWR(
    profileId ? `/api/users/${profileId}/events?limit=24` : null,
    fetcher,
  );

  const events = useMemo<RawEvent[]>(() => data?.items ?? [], [data?.items]);
  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const displayEvents = showAll ? sortedEvents : sortedEvents.slice(0, 4);

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = window.confirm(
      "Delete this event? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingEventId(eventId);
    try {
      const response = await makeAuthenticatedRequest(
        `/api/events/${eventId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        toast.error("Failed to delete event");
        return;
      }
      toast.success("Event deleted");
      if (panel?.event.id === eventId) setPanel(null);
      mutate(`/api/users/${profileId}/events?limit=24`);
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-base leading-relaxed text-muted/80">
        Loading events...
      </div>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <div className="text-base leading-relaxed text-muted/80">
        No events yet.
      </div>
    );
  }

  return (
    <>
      {isOwnProfile && events.length > 4 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
          >
            {showAll ? "Show less" : "Show all"}
          </button>
        </div>
      )}

      <div className={showAll ? "max-h-[420px] overflow-y-auto pr-2" : ""}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {displayEvents.map((event) => {
            const mapped = rawEventToEvent(event, profileId);
            const isDeleting = deletingEventId === event.id;
            return (
              <div key={event.id} className="relative group">
                <EventGridCard
                  event={mapped}
                  onClick={() => {
                    if (isOwnProfile) {
                      window.location.href = `${TICKETING_URL}/events/${event.id}/edit`;
                    } else {
                      setPanel({ event: mapped });
                    }
                  }}
                />

                {/* Draft badge — own profile only */}
                {isOwnProfile && event.status !== "published" && (
                  <span className="absolute top-0 left-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Draft
                  </span>
                )}

                {canManageEvents && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteEvent(event.id);
                    }}
                    disabled={isDeleting}
                    aria-label={`Delete ${mapped.name}`}
                    className="absolute bottom-2 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setPanel(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 overflow-hidden"
            >
              <div className="relative h-full overflow-y-auto scrollbar-hide">
                <EventDetailPanel
                  event={panel.event}
                  mode="view"
                  onBack={() => setPanel(null)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
