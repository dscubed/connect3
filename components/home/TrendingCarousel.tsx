"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Globe, Camera, ArrowRight } from "lucide-react";

interface Organizer {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface TrendingEvent {
  id: string;
  name: string;
  start: string | null;
  thumbnail: string | null;
  location: string | null;
  isOnline: boolean;
  status: "published" | "draft" | "live" | "upcoming" | "past";
  organizers: Organizer[];
}

const MOCK_TRENDING: TrendingEvent[] = [
  {
    id: "t1",
    name: "Google DeepMind x UniMelb AI Night",
    start: "2026-05-08T18:30:00",
    thumbnail: null,
    location: "Parkville Campus",
    isOnline: false,
    status: "live",
    organizers: [{ id: "i", name: "AI & ML Society", avatar_url: null }],
  },
  {
    id: "t2",
    name: "Law Ball 2026",
    start: "2026-05-15T19:00:00",
    thumbnail: null,
    location: "Crown Palladium",
    isOnline: false,
    status: "upcoming",
    organizers: [{ id: "j", name: "Melbourne Law Students Society", avatar_url: null }],
  },
  {
    id: "t3",
    name: "Startup Weekend Melbourne",
    start: "2026-05-17T09:00:00",
    thumbnail: null,
    location: "Inspire9, Richmond",
    isOnline: false,
    status: "upcoming",
    organizers: [
      { id: "k", name: "Entrepreneurs Club", avatar_url: null },
      { id: "l", name: "MBS Student Society", avatar_url: null },
    ],
  },
  {
    id: "t4",
    name: "Cybersecurity CTF Challenge",
    start: "2026-05-22T10:00:00",
    thumbnail: null,
    location: null,
    isOnline: true,
    status: "upcoming",
    organizers: [{ id: "m", name: "Cybersecurity Society", avatar_url: null }],
  },
  {
    id: "t5",
    name: "Design Thinking Bootcamp",
    start: "2026-05-24T13:00:00",
    thumbnail: null,
    location: "Melbourne Connect",
    isOnline: false,
    status: "upcoming",
    organizers: [{ id: "n", name: "Design Society", avatar_url: null }],
  },
  {
    id: "t6",
    name: "IMC Trading Simulation",
    start: "2026-05-21T13:00:00",
    thumbnail: null,
    location: null,
    isOnline: true,
    status: "live",
    organizers: [{ id: "f", name: "Trading Club", avatar_url: null }],
  },
  {
    id: "t7",
    name: "STEM Panel Night",
    start: "2026-05-14T17:30:00",
    thumbnail: null,
    location: "Alan Gilbert Building",
    isOnline: false,
    status: "upcoming",
    organizers: [
      { id: "c", name: "Engineering Society", avatar_url: null },
      { id: "d", name: "Science Club", avatar_url: null },
    ],
  },
];

function fmtDate(iso: string | null) {
  if (!iso) return "TBA";
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function OrgAvatar({ org, size }: { org: Organizer; size: number }) {
  const initials = org.name.slice(0, 2).toUpperCase();
  if (org.avatar_url) {
    return (
      <img
        src={org.avatar_url}
        alt={org.name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0 ring-2 ring-white"
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-purple-100 ring-2 ring-white"
      style={{ width: size, height: size }}
    >
      <span className="font-semibold text-purple-600" style={{ fontSize: size * 0.38 }}>
        {initials}
      </span>
    </div>
  );
}

function OrganizerStack({ organizers }: { organizers: Organizer[] }) {
  if (!organizers.length) return null;
  const size = 16;
  const MAX = 3;
  const shown = organizers.slice(0, MAX);
  const extra = organizers.length - MAX;
  const [first] = organizers;
  const label =
    organizers.length === 1
      ? first.name
      : `${first.name} + ${organizers.length - 1} other${organizers.length - 1 > 1 ? "s" : ""}`;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="flex shrink-0">
        {shown.map((org, i) => (
          <div key={org.id} style={{ marginLeft: i === 0 ? 0 : -(size * 0.3) }}>
            <OrgAvatar org={org} size={size} />
          </div>
        ))}
        {extra > 0 && (
          <div
            className="flex shrink-0 items-center justify-center rounded-full bg-gray-200 ring-2 ring-white"
            style={{ width: size, height: size, marginLeft: -(size * 0.3), fontSize: size * 0.32 }}
          >
            <span className="font-semibold text-gray-500">+{extra}</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-400 truncate">{label}</span>
    </div>
  );
}

function EventCard({ event }: { event: TrendingEvent }) {
  const router = useRouter();
  return (
    <div
      className="flex flex-col gap-2.5 cursor-pointer group shrink-0 w-[160px] sm:w-[180px]"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Square thumbnail */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
        {event.thumbnail ? (
          <Image
            src={event.thumbnail}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <Camera className="h-8 w-8 text-purple-300" />
        )}
        {event.status === "draft" && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide bg-amber-400/90 text-amber-900 px-2 py-0.5 rounded-md backdrop-blur-sm">
            Draft
          </span>
        )}
        {event.status === "live" && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-green-500/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Details below thumbnail */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">
          {fmtDate(event.start)}
        </p>
        <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#854ECB] transition-colors line-clamp-2">
          {event.name}
        </p>
        <OrganizerStack organizers={event.organizers} />
        <p className="flex items-center gap-1 text-[10px] text-gray-400 truncate">
          {event.isOnline ? (
            <Globe className="h-2.5 w-2.5 shrink-0" />
          ) : (
            <MapPin className="h-2.5 w-2.5 shrink-0" />
          )}
          {event.isOnline ? "Online" : (event.location ?? "TBA")}
        </p>
      </div>
    </div>
  );
}

export function TrendingCarousel() {
  return (
    <section className="pt-10 pb-4">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 xl:px-12 mb-5">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
          Trending
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          See all events
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div
        className="flex gap-4 overflow-x-auto px-4 md:px-6 lg:px-8 xl:px-12 scroll-pl-4 md:scroll-pl-6 lg:scroll-pl-8 xl:scroll-pl-12 pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
      >
        {MOCK_TRENDING.map((event) => (
          <div key={event.id} style={{ scrollSnapAlign: "start" }}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
