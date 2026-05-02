"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { MapPin, Globe, Camera, Ticket } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import Image from "next/image";

interface UpcomingEvent {
  id: string;
  name: string;
  start: string | null;
  thumbnail: string | null;
  location: string | null;
  isOnline: boolean;
  ticketCount: number;
}

const MOCK_UPCOMING: UpcomingEvent[] = [
  {
    id: "u1",
    name: "Career Compass: Finance Panel",
    start: "2026-05-10T18:00:00",
    thumbnail: null,
    location: "The Melbourne Theatre",
    isOnline: false,
    ticketCount: 1,
  },
  {
    id: "u2",
    name: "IMC Trading Simulation",
    start: "2026-05-21T13:00:00",
    thumbnail: null,
    location: null,
    isOnline: true,
    ticketCount: 2,
  },
  {
    id: "u3",
    name: "Law Ball 2026",
    start: "2026-05-15T19:00:00",
    thumbnail: null,
    location: "Crown Palladium",
    isOnline: false,
    ticketCount: 1,
  },
];

function fmtDate(iso: string | null) {
  if (!iso) return "TBA";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function greeting(name: string | null) {
  const h = new Date().getHours();
  const time =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return name ? `${time}, ${name}` : time;
}

function UpcomingEventCard({ event }: { event: UpcomingEvent }) {
  const router = useRouter();
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
        {event.thumbnail ? (
          <Image
            src={event.thumbnail}
            alt={event.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <Camera className="h-5 w-5 text-purple-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#854ECB] transition-colors">
          {event.name}
        </p>
        <p className="text-xs text-muted-foreground">{fmtDate(event.start)}</p>
        <p className="flex items-center gap-1 text-xs text-gray-400 truncate mt-0.5">
          {event.isOnline ? (
            <Globe className="h-3 w-3 shrink-0" />
          ) : (
            <MapPin className="h-3 w-3 shrink-0" />
          )}
          {event.isOnline ? "Online" : (event.location ?? "TBA")}
        </p>
      </div>

      {/* Ticket badge */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-600 shrink-0">
        <Ticket className="h-3 w-3" />
        <span className="text-[11px] font-semibold">{event.ticketCount}</span>
      </div>
    </div>
  );
}

export function HomeGreeting() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 xl:px-12 pt-10 pb-2 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting(profile?.first_name ?? null)}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s coming up for you.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-3xl bg-gradient-to-br from-[#ede4ff] to-[#d9c9ff] px-6 py-16 flex flex-col items-center gap-4">
        <h2 className="font-fredoka text-2xl md:text-3xl font-semibold text-[#5c2fa0] tracking-[0.01em] text-center">
          Discover more on campus
        </h2>
        <SearchInput className="w-full max-w-xl" onSubmit={handleSearch} />
      </div>

      {/* Upcoming events */}
      {MOCK_UPCOMING.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
            Your upcoming events
          </p>
          <div className="flex flex-col gap-2">
            {MOCK_UPCOMING.map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
