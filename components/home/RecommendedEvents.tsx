"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Globe, Camera, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface Organizer {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface HomeEvent {
  id: string;
  name: string;
  start: string | null;
  thumbnail: string | null;
  location: string | null;
  isOnline: boolean;
  isFree: boolean;
  status: "published" | "draft" | "live" | "upcoming" | "past";
  organizers: Organizer[];
}

const RECOMMENDED: HomeEvent[] = [
  {
    id: "1",
    name: "Career Compass: Finance Panel",
    start: "2026-05-10T18:00:00",
    thumbnail: null,
    location: "The Melbourne Theatre",
    isOnline: false,
    isFree: true,
    status: "upcoming",
    organizers: [
      { id: "a", name: "Finance Society", avatar_url: null },
      { id: "b", name: "Commerce Club", avatar_url: null },
    ],
  },
  {
    id: "2",
    name: "STEM Panel Night",
    start: "2026-05-14T17:30:00",
    thumbnail: null,
    location: "Alan Gilbert Building, Parkville",
    isOnline: false,
    isFree: true,
    status: "upcoming",
    organizers: [
      { id: "c", name: "Engineering Society", avatar_url: null },
      { id: "d", name: "Science Club", avatar_url: null },
    ],
  },
  {
    id: "3",
    name: "IMC Trading Simulation",
    start: "2026-05-21T13:00:00",
    thumbnail: null,
    location: null,
    isOnline: true,
    isFree: false,
    status: "live",
    organizers: [{ id: "f", name: "Trading Club", avatar_url: null }],
  },
  {
    id: "4",
    name: "EV Office Tour",
    start: "2026-05-28T10:00:00",
    thumbnail: null,
    location: "Melbourne CBD",
    isOnline: false,
    isFree: true,
    status: "upcoming",
    organizers: [
      { id: "g", name: "EV Society", avatar_url: null },
      { id: "h", name: "Engineering Club", avatar_url: null },
    ],
  },
  {
    id: "10",
    name: "Product Management 101 Workshop",
    start: "2026-05-30T14:00:00",
    thumbnail: null,
    location: "Business School, Level 3",
    isOnline: false,
    isFree: true,
    status: "upcoming",
    organizers: [{ id: "o", name: "Product Society", avatar_url: null }],
  },
];

const TRENDING: HomeEvent[] = [
  {
    id: "5",
    name: "Google DeepMind x UniMelb AI Night",
    start: "2026-05-08T18:30:00",
    thumbnail: null,
    location: "Parkville Campus",
    isOnline: false,
    isFree: false,
    status: "live",
    organizers: [{ id: "i", name: "AI & ML Society", avatar_url: null }],
  },
  {
    id: "6",
    name: "Law Ball 2026",
    start: "2026-05-15T19:00:00",
    thumbnail: null,
    location: "Crown Palladium",
    isOnline: false,
    isFree: false,
    status: "upcoming",
    organizers: [
      { id: "j", name: "Melbourne Law Students Society", avatar_url: null },
    ],
  },
  {
    id: "7",
    name: "Startup Weekend Melbourne",
    start: "2026-05-17T09:00:00",
    thumbnail: null,
    location: "Inspire9, Richmond",
    isOnline: false,
    isFree: false,
    status: "upcoming",
    organizers: [
      { id: "k", name: "Entrepreneurs Club", avatar_url: null },
      { id: "l", name: "MBS Student Society", avatar_url: null },
    ],
  },
  {
    id: "8",
    name: "Cybersecurity CTF Challenge",
    start: "2026-05-22T10:00:00",
    thumbnail: null,
    location: null,
    isOnline: true,
    isFree: true,
    status: "upcoming",
    organizers: [{ id: "m", name: "Cybersecurity Society", avatar_url: null }],
  },
  {
    id: "9",
    name: "Design Thinking Bootcamp",
    start: "2026-05-24T13:00:00",
    thumbnail: null,
    location: "Melbourne Connect",
    isOnline: false,
    isFree: true,
    status: "upcoming",
    organizers: [{ id: "n", name: "Design Society", avatar_url: null }],
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
      <span
        className="font-semibold text-purple-600"
        style={{ fontSize: size * 0.38 }}
      >
        {initials}
      </span>
    </div>
  );
}

function OrganizerStack({ organizers }: { organizers: Organizer[] }) {
  if (!organizers.length) return null;
  const size = 18;
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
            style={{
              width: size,
              height: size,
              marginLeft: -(size * 0.3),
              fontSize: size * 0.32,
            }}
          >
            <span className="font-semibold text-gray-500">+{extra}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] text-gray-400 truncate">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: HomeEvent["status"] }) {
  if (status === "draft")
    return (
      <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wide bg-amber-400/90 text-amber-900 px-2 py-0.5 rounded-md backdrop-blur-sm">
        Draft
      </span>
    );
  if (status === "live")
    return (
      <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-green-500/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Live
      </span>
    );
  return null;
}

function EventCard({ event }: { event: HomeEvent }) {
  const router = useRouter();
  return (
    <div
      className="flex flex-col sm:flex-row gap-0 sm:gap-3 group cursor-pointer flex-1 min-w-[140px] sm:flex-none sm:min-w-0 sm:w-auto"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-square sm:aspect-auto sm:w-[90px] sm:h-[90px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center sm:shrink-0">
        {event.thumbnail ? (
          <Image
            src={event.thumbnail}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <Camera className="h-7 w-7 text-purple-300" />
        )}
        <StatusBadge status={event.status} />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1 mt-2 sm:mt-0 sm:justify-center">
        <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
          {fmtDate(event.start)}
        </p>
        <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#854ECB] transition-colors line-clamp-2">
          {event.name}
        </p>
        <OrganizerStack organizers={event.organizers} />
        <p className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
          {event.isOnline ? (
            <Globe className="h-3 w-3 shrink-0" />
          ) : (
            <MapPin className="h-3 w-3 shrink-0" />
          )}
          {event.isOnline ? "Online" : (event.location ?? "TBA")}
        </p>
      </div>
    </div>
  );
}

function TrendingCard({ event, rank }: { event: HomeEvent; rank: number }) {
  const router = useRouter();
  return (
    <div
      className="flex flex-col sm:flex-row gap-0 sm:gap-3 group cursor-pointer flex-1 min-w-[140px] sm:flex-none sm:min-w-0 sm:w-auto"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Thumbnail with rank overlay */}
      <div className="relative w-full aspect-square sm:aspect-auto sm:w-[90px] sm:h-[90px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center sm:shrink-0">
        <span className="absolute bottom-1.5 left-2 text-2xl font-black text-white/60 leading-none select-none z-10">
          {rank}
        </span>
        {event.thumbnail ? (
          <Image
            src={event.thumbnail}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <Camera className="h-7 w-7 text-purple-300" />
        )}
        <StatusBadge status={event.status} />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1 mt-2 sm:mt-0 sm:justify-center">
        <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
          {fmtDate(event.start)}
        </p>
        <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#854ECB] transition-colors line-clamp-2">
          {event.name}
        </p>
        <OrganizerStack organizers={event.organizers} />
        <p className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
          {event.isOnline ? (
            <Globe className="h-3 w-3 shrink-0" />
          ) : (
            <MapPin className="h-3 w-3 shrink-0" />
          )}
          {event.isOnline ? "Online" : (event.location ?? "TBA")}
        </p>
      </div>
    </div>
  );
}

function RecommendedSkeletons() {
  return (
    <div className="relative">
      <div className="flex flex-row sm:flex-col gap-3 sm:gap-5 overflow-x-hidden pointer-events-none select-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-0 sm:gap-3 w-[148px] sm:w-auto shrink-0 sm:shrink"
          >
            <div className="w-full aspect-square sm:aspect-auto sm:w-[90px] sm:h-[90px] rounded-xl bg-gray-100 animate-pulse sm:shrink-0" />
            <div className="flex flex-col gap-2 flex-1 min-w-0 mt-2 sm:mt-0 sm:justify-center">
              <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Overlay banner */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              Sign in to get personalised
              <br />
              event recommendations
            </p>
          </div>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-[#854ECB] text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RecommendedEvents() {
  const { user, loading } = useAuthStore();
  const isLoggedIn = !loading && !!user;

  return (
    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 pt-10 pb-12">
      <div className="flex flex-col sm:flex-row gap-0 items-start">
        {/* ── Left: Recommended ── */}
        <div className="flex-1 min-w-0 sm:pr-8 lg:pr-12 w-full">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-5">
            Recommended
          </p>
          {isLoggedIn ? (
            <div
              className="flex flex-row sm:flex-col gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {RECOMMENDED.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <RecommendedSkeletons />
          )}
        </div>

        {/* ── Divider ── */}
        <div className="hidden sm:block w-px self-stretch bg-gray-100 shrink-0" />
        <div className="sm:hidden w-full h-px bg-gray-100 my-8" />

        {/* ── Right: Trending ── */}
        <div className="flex-1 min-w-0 sm:pl-8 lg:pl-12 w-full">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-5">
            Trending
          </p>
          <div
            className="flex flex-row sm:flex-col gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {TRENDING.slice(0, 3).map((event, i) => (
              <TrendingCard key={event.id} event={event} rank={i + 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Single view more link */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          View more events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
