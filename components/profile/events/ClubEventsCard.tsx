"use client";

import useSWR, { useSWRConfig } from "swr";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProfileContext } from "@/components/profile/ProfileProvider";
import { useAuthStore } from "@/stores/authStore";
import EventFormSheet from "@/components/profile/events/EventFormSheet";
import { EventGridCard } from "@/components/events/EventGridCard";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import type { Event } from "@/lib/schemas/events/event";
import type { CreateEventBody } from "@/lib/schemas/api/events";
import { toast } from "sonner";

type RawEvent = {
  id: string;
  name?: string | null;
  start?: string | null;
  end?: string | null;
  description?: string | null;
  booking_url?: string | null;
  is_online?: boolean | null;
  thumbnail?: string | null;
  created_at?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function rawEventToEvent(raw: RawEvent, creatorProfileId: string): Event {
  return {
    id: raw.id,
    name: raw.name || "Untitled event",
    creatorProfileId,
    description: raw.description || "",
    bookingUrl: raw.booking_url || "",
    start: raw.start || new Date().toISOString(),
    end: raw.end || new Date().toISOString(),
    publishedAt: raw.created_at || new Date().toISOString(),
    isOnline: raw.is_online ?? false,
    capacity: 0,
    currency: "",
    thumbnail: raw.thumbnail || "",
    category: "",
    location: { venue: "TBA", address: "TBA", latitude: 0, longitude: 0, city: "TBA", country: "TBA" },
    pricing: { min: 0, max: 0 },
  } as Event;
}

const sortEvents = (events: RawEvent[]) => {
  const now = Date.now();
  const upcoming = events
    .filter((event) => {
      if (!event.start) return false;
      const date = new Date(event.start).getTime();
      return !Number.isNaN(date) && date >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.start ?? 0).getTime() - new Date(b.start ?? 0).getTime()
    );

  const past = events
    .filter((event) => {
      if (!event.start) return false;
      const date = new Date(event.start).getTime();
      return !Number.isNaN(date) && date < now;
    })
    .sort(
      (a, b) =>
        new Date(b.start ?? 0).getTime() - new Date(a.start ?? 0).getTime()
    );

  return [...upcoming, ...past];
};

export default function ClubEventsCard({
  profileId,
}: {
  profileId: string;
}) {
  const { isOwnProfile } = useProfileContext();
  const { makeAuthenticatedRequest } = useAuthStore();
  const { mutate } = useSWRConfig();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useSWR(
    profileId ? `/api/users/${profileId}/events?limit=24` : null,
    fetcher
  );
  const { data: eventDetailData } = useSWR(
    editingEventId
      ? `/api/events/${editingEventId}`
      : viewingEvent
        ? `/api/events/${viewingEvent.id}`
        : null,
    fetcher
  );

  const events = useMemo<RawEvent[]>(() => data?.items ?? [], [data?.items]);
  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const displayEvents = showAll ? sortedEvents : sortedEvents.slice(0, 4);
  const selectedEventDetail = eventDetailData?.event ?? null;

  const viewingEventFull: Event | null = useMemo(() => {
    if (!viewingEvent) return null;
    if (selectedEventDetail && selectedEventDetail.id === viewingEvent.id) {
      return selectedEventDetail as Event;
    }
    return viewingEvent;
  }, [viewingEvent, selectedEventDetail]);

  const detail = selectedEventDetail ?? (editingEventId ? events.find((e) => e.id === editingEventId) : null);
  const detailCategory = selectedEventDetail?.category ?? null;
  const detailLocation = selectedEventDetail?.location ?? null;
  const detailPricing = selectedEventDetail?.pricing ?? null;
  const detailCurrency = selectedEventDetail?.currency ?? null;
  const detailIsOnline = selectedEventDetail?.isOnline ?? null;
  const detailPoster = selectedEventDetail?.thumbnail ?? null;

  const editingEventSummary = editingEventId ? events.find((e) => e.id === editingEventId) : null;

  const editInitialValues = useMemo(() => {
    if (!detail) return undefined;
    const bookingUrl =
      selectedEventDetail?.bookingUrl ||
      editingEventSummary?.booking_url ||
      "";
    const rawCategory =
      typeof detailCategory === "string"
        ? detailCategory
        : detailCategory?.category ?? detailCategory?.type ?? "";
    const allowedCategories = new Set([
      "networking", "study", "fun", "workshop", "competition", "panel", "miscellaneous",
    ]);
    const mappedCategories = allowedCategories.has(rawCategory) ? [rawCategory] : [];
    const locationPayload = detailLocation
      ? {
          venue: detailLocation.venue ?? "",
          address: detailLocation.address ?? "",
          city: detailLocation.city ?? "",
          country: detailLocation.country ?? "",
        }
      : undefined;
    const pricingMinValue = detailPricing ? Number(detailPricing.min ?? 0) : 0;
    const pricingMaxValue = detailPricing ? Number(detailPricing.max ?? 0) : 0;
    return {
      name: detail.name ?? "",
      description: detail.description ?? "",
      start: detail.start ?? undefined,
      end: detail.end ?? undefined,
      booking_link: bookingUrl ? [bookingUrl] : [],
      type: mappedCategories,
      pricing: pricingMinValue > 0 || pricingMaxValue > 0 ? "paid" : "free",
      pricing_min: pricingMinValue,
      pricing_max: pricingMaxValue,
      currency: detailCurrency ?? undefined,
      city: locationPayload?.city ? [locationPayload.city] : [],
      location_type: detailIsOnline === true ? "virtual" : "physical",
      location: locationPayload,
      thumbnailUrl: detailPoster ?? undefined,
    } satisfies Partial<Omit<CreateEventBody, "id">>;
  }, [
    detail,
    selectedEventDetail,
    editingEventSummary,
    detailCategory,
    detailLocation,
    detailPricing,
    detailCurrency,
    detailIsOnline,
    detailPoster,
  ]);

  const handleEditSubmit = async (
    eventData: Omit<CreateEventBody, "id">
  ) => {
    if (!editingEventId) return;
    const response = await makeAuthenticatedRequest(
      `/api/events/${editingEventId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!response.ok) {
      toast.error("Failed to update event");
      return;
    }

    const vectorResponse = await makeAuthenticatedRequest(
      `/api/vector-store/events/${editingEventId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!vectorResponse.ok) {
      toast.error("Event updated, but vector store sync failed");
    } else {
      toast.success("Event updated");
    }
    setEditingEventId(null);
    mutate(`/api/users/${profileId}/events?limit=24`);
    mutate(`/api/events/${editingEventId}`);
  };

  if (isLoading) {
    return (
      <div className="text-base leading-relaxed text-muted/80">Loading events...</div>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <div className="text-base leading-relaxed text-muted/80">No events yet.</div>
    );
  }

  return (
    <>
      {isOwnProfile && events.length > 4 ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
          >
            {showAll ? "Show less" : "Show all"}
          </button>
        </div>
      ) : null}

      <div className={showAll ? "max-h-[420px] overflow-y-auto pr-2" : ""}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {displayEvents.map((event) => {
            const mapped = rawEventToEvent(event, profileId);
            return (
              <EventGridCard
                key={event.id}
                event={mapped}
                onClick={() => {
                  if (isOwnProfile) {
                    setEditingEventId(event.id);
                    setViewingEvent(null);
                  } else {
                    setViewingEvent(mapped);
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {viewingEventFull && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setViewingEvent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
              <div className="relative h-full overflow-y-auto scrollbar-hide">
                <button
                  onClick={() => setViewingEvent(null)}
                  className="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors rounded-full shadow-sm"
                >
                  ✕
                </button>
                <EventDetailPanel event={viewingEventFull} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <EventFormSheet
        open={Boolean(editingEventId)}
        onOpenChange={(open) => {
          if (!open) setEditingEventId(null);
        }}
        onSubmit={handleEditSubmit}
        initialValues={editInitialValues}
        submitLabel="Save Changes"
        modeLabel="Edit Event"
        formKey={editingEventId ?? "edit-event"}
      />
    </>
  );
}
