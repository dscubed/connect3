"use client";

import { type Event } from "@/lib/schemas/events/event";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EventsHeroSectionProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function EventsHeroSection({
  events,
  onEventClick,
}: EventsHeroSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const featuredEvents = events.slice(0, 8);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const eventsThisWeek = featuredEvents.length === 0
    ?
    <p>No events</p>
    :
    (featuredEvents.map((event) => (
      <div
        key={event.id}
        onClick={() => {
          if (onEventClick) {
            onEventClick(event);
          } else {
            router.push(`/events/${event.id}`);
          }
        }}
        className="flex-shrink-0 w-64 bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div className="relative h-36 w-full bg-purple-100">
          {event.thumbnail ? (
            <Image
              src={event.thumbnail}
              alt={event.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-purple-300 text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-black text-sm truncate">
            {event.name}
          </h3>
          <p className="text-purple-500 text-xs mt-0.5">
            {event.category}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {new Date(event.start).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            ,{" "}
            {new Date(event.start).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <p className="text-black text-xs font-medium mt-2">
            View Event →
          </p>
        </div>
      </div>
    )))

  return (
    <div className="relative rounded-3xl overflow-hidden p-6 md:p-10 min-h-[320px]">
      {/* Cover image background */}
      <Image
        src="/cover/cover-purple.png"
        alt="Events cover"
        fill
        className="object-cover object-center"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/50" />

      <div className="relative z-10 flex gap-8 items-start">
        {/* Left - Title */}
        <div className="flex-shrink-0 pt-8">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-white/80 text-lg">✦</span>
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight">
            What&apos;s on
            <br />
            this week
          </h2>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-white/80 text-sm">✦</span>
            <span className="text-white/60 text-xs ml-2">✦</span>
          </div>
        </div>

        {/* Right - Scrolling Cards */}
        <div className="flex-1 min-w-0 relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pt-4 pb-2 scrollbar-styled"
          >
            {eventsThisWeek}
          </div>
        </div>
      </div>
    </div>
  );
}
