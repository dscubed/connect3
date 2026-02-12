"use client";

import Image from "next/image";
import useSWR from "swr";

type RawEvent = {
  id: string;
  name?: string | null;
  start?: string | null;
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
  const { data, isLoading } = useSWR(
    profileId ? `/api/users/${profileId}/events?limit=24` : null,
    fetcher
  );

  const events: RawEvent[] = data?.items ?? [];
  const displayEvents = sortEvents(events).slice(0, 4);

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {displayEvents.map((event) => (
        <div key={event.id} className="flex items-start gap-4">
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
        </div>
      ))}
    </div>
  );
}
