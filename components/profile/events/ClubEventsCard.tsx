"use client";

import Image from "next/image";
import useSWR, { useSWRConfig } from "swr";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfileContext } from "@/components/profile/ProfileProvider";
import { useAuthStore } from "@/stores/authStore";
import EventFormSheet from "@/components/profile/events/EventFormSheet";
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

const PLACEHOLDER_TAGS = [
  { label: "Paid", className: "bg-pink-100 text-pink-600" },
  { label: "Members-only", className: "bg-emerald-100 text-emerald-600" },
  { label: "+2 more", className: "bg-purple-100 text-purple-600" },
];

const formatEventDate = (start?: string | null) => {
  if (!start) return "Date TBD";
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timePart = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(" ", "");
  return `${datePart}, ${timePart}`;
};

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
  clubName,
}: {
  profileId: string;
  clubName: string;
}) {
  const { isOwnProfile } = useProfileContext();
  const { makeAuthenticatedRequest } = useAuthStore();
  const { mutate } = useSWRConfig();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useSWR(
    profileId ? `/api/users/${profileId}/events?limit=24` : null,
    fetcher
  );
  const { data: eventDetailData, isLoading: isLoadingDetail } = useSWR(
    editingEventId || viewingEventId
      ? `/api/events/${editingEventId ?? viewingEventId}`
      : null,
    fetcher
  );

  const events = useMemo<RawEvent[]>(() => data?.items ?? [], [data?.items]);
  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const displayEvents = showAll ? sortedEvents : sortedEvents.slice(0, 4);
  const selectedEventId = editingEventId ?? viewingEventId;
  const selectedEventDetail = eventDetailData?.event ?? null;
  const selectedEventSummary =
    selectedEventId != null
      ? events.find((event) => event.id === selectedEventId) ?? null
      : null;
  const detail = selectedEventDetail ?? selectedEventSummary;
  const detailTitle = detail?.name || "Untitled event";
  const detailPoster =
    selectedEventDetail?.thumbnail || selectedEventSummary?.thumbnail || null;
  const detailStart =
    selectedEventDetail?.start || selectedEventSummary?.start || null;
  const detailEnd =
    selectedEventDetail?.end || selectedEventSummary?.end || null;
  const detailDescription =
    selectedEventDetail?.description ||
    selectedEventSummary?.description ||
    "";
  const detailBookingUrl =
    selectedEventDetail?.bookingUrl || selectedEventSummary?.booking_url || "";
  const detailIsOnline =
    selectedEventDetail?.isOnline ??
    selectedEventSummary?.is_online ??
    null;
  const detailLocation = selectedEventDetail?.location ?? null;
  const detailPricing = selectedEventDetail?.pricing ?? null;
  const detailCurrency = selectedEventDetail?.currency ?? null;
  const detailCategory = selectedEventDetail?.category ?? null;
  const cleanedDescription = detailDescription
    ?.replace(/#[\w-]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const locationLines = (() => {
    if (!detailLocation) return [];
    const cleanValue = (value?: string | null) => {
      const trimmed = value?.trim();
      if (!trimmed) return "";
      if (trimmed.toLowerCase() === "tba") return "";
      return trimmed;
    };
    const lines: string[] = [];
    const venue = cleanValue(detailLocation.venue);
    const address = cleanValue(detailLocation.address);
    const city = cleanValue(detailLocation.city);
    const country = cleanValue(detailLocation.country);
    if (venue) lines.push(venue);
    if (address) lines.push(address);
    if (city || country) {
      lines.push([city, country].filter(Boolean).join(", "));
    }
    return lines;
  })();
  const locationLine = locationLines.join(" · ");
  const pricingMin = detailPricing ? Number(detailPricing.min ?? 0) : null;
  const pricingMax = detailPricing ? Number(detailPricing.max ?? 0) : null;
  const isFree =
    detailPricing && pricingMin === 0 && pricingMax === 0;
  const ctaLabel = isFree ? "Register" : "Get Tickets";

  const editInitialValues = useMemo(() => {
    if (!detail) return undefined;
    const bookingUrl =
      selectedEventDetail?.bookingUrl ||
      selectedEventSummary?.booking_url ||
      "";
    const rawCategory =
      typeof detailCategory === "string"
        ? detailCategory
        : detailCategory?.category ?? detailCategory?.type ?? "";
    const allowedCategories = new Set([
      "networking",
      "study",
      "fun",
      "workshop",
      "competition",
      "panel",
      "miscellaneous",
    ]);
    const mappedCategories = allowedCategories.has(rawCategory)
      ? [rawCategory]
      : [];
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
      pricing:
        pricingMinValue > 0 || pricingMaxValue > 0 ? "paid" : "free",
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
    selectedEventSummary,
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
      <div className="py-4 text-sm text-slate-400">Loading events...</div>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <div className="py-4 text-sm text-slate-400">No events yet.</div>
    );
  }

  return (
    <>
      {isOwnProfile && events.length > 4 ? (
        <div className="mb-3 flex justify-end">
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
          {displayEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                if (isOwnProfile) {
                  setEditingEventId(event.id);
                  setViewingEventId(null);
                } else {
                  setViewingEventId(event.id);
                }
              }}
              className="flex items-start gap-4 text-left"
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {event.thumbnail ? (
                  <Image
                    src={event.thumbnail}
                    alt={event.name ? `${event.name} poster` : "Event poster"}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    Poster
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {event.name || "Untitled event"}
                </div>
                <div className="text-sm font-medium text-purple-600">
                  {clubName}
                </div>
                <div className="text-xs text-slate-500">
                  {formatEventDate(event.start)}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PLACEHOLDER_TAGS.map((tag) => (
                    <span
                      key={`${event.id}-${tag.label}`}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tag.className}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={Boolean(viewingEventId)}
        onOpenChange={(open) => {
          if (!open) setViewingEventId(null);
        }}
      >
        <DialogContent
          overlayClassName="bg-black/[0.35]"
          className="max-w-none w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] lg:min-w-[50vw] xl:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 bg-white"
        >
          <DialogTitle className="sr-only">
            {detailTitle}
          </DialogTitle>
          {isLoadingDetail ? (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="h-44 w-full flex-shrink-0 rounded-2xl border border-slate-200 bg-slate-100 sm:h-52 md:h-56 md:w-56" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-4 w-2/5 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ) : detail ? (
            <div className="p-6 sm:p-8">
              <>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="h-44 w-full flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-52 md:h-56 md:w-56">
                    {detailPoster ? (
                      <Image
                        src={detailPoster}
                        alt={
                          detailTitle ? `${detailTitle} poster` : "Event poster"
                        }
                        width={224}
                        height={224}
                        className="h-full w-full object-cover"
                      />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                      Poster
                    </div>
                  )}
                </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                      {detailTitle}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-purple-600">
                      {clubName}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {formatEventDate(detailStart)}
                        </span>
                        {detailEnd ? (
                          <span className="text-slate-500">
                            · Ends{" "}
                            {new Date(detailEnd).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : null}
                        <span className="text-slate-500">
                          · Local time
                        </span>
                      </div>
                      <div>
                        {detailIsOnline === true
                          ? "Online event"
                          : locationLine || "Location coming soon"}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {PLACEHOLDER_TAGS.map((tag) => (
                        <span
                          key={`${selectedEventId}-${tag.label}-detail`}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tag.className}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-6 space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      About
                    </h3>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {cleanedDescription || "Description coming soon."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Pricing
                    </h3>
                    <div className="mt-2 text-sm text-slate-700">
                      {detailPricing ? (
                        isFree ? (
                          <p>Free</p>
                        ) : (
                          <p>
                            {detailCurrency ? `${detailCurrency} ` : ""}
                            {pricingMin ?? 0} - {pricingMax ?? 0}
                          </p>
                        )
                      ) : (
                        <p>Pricing details coming soon.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Booking
                    </h3>
                    <div className="mt-3">
                      {detailBookingUrl ? (
                        <a
                          href={detailBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          {ctaLabel}
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-400"
                          disabled
                        >
                          {ctaLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            </div>
          ) : (
            <div className="p-8 text-sm text-slate-400">
              Unable to load event details.
            </div>
          )}
        </DialogContent>
      </Dialog>

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
