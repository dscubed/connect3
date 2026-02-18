"use client";

import { type Event } from "@/lib/schemas/events/event";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Character } from "@/components/characters";

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

  return (
    <div className="relative rounded-3xl overflow-hidden p-6 md:p-10 min-h-[320px]"
      style={{
        background: "linear-gradient(135deg, #c8a2f0 0%, #b47de8 30%, #d4a8f5 60%, #c490ee 100%)",
      }}
    >
      {/* Checkered pattern overlay on right side */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[75%] opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #4338ca 25%, transparent 25%),
            linear-gradient(-45deg, #4338ca 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #4338ca 75%),
            linear-gradient(-45deg, transparent 75%, #4338ca 75%)
          `,
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 0 14px, 14px -14px, 14px 0px",
        }}
      />

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

        {/* Right - Scrolling Cards with Characters */}
        <div className="flex-1 min-w-0 relative">
          {/* Floating Characters */}
          <div className="absolute -top-2 left-[15%] z-20">
            <Character color="green" expression="open" size={56} />
          </div>
          <div className="absolute -top-3 left-[50%] z-20">
            <Character color="green" expression="cheeky" size={52} />
          </div>
          <div className="absolute -top-2 right-[10%] z-20">
            <Character color="orange" expression="wink" size={52} />
          </div>

          {/* Scrolling Cards */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pt-10 pb-2"
          >
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick ? onEventClick(event) : router.push(`/events/${event.id}`)}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
