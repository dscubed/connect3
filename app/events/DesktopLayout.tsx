"use client";
import EventsHeroSection from "@/components/events/EventsHeroSection";
import EventGridFilters from "@/components/events/EventGridFilters";
import { EventGridCard } from "@/components/events/EventGridCard";
import { EventCategory } from "@/types/events/event";
import { useRef, useState } from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { filterEvents } from "@/lib/events/eventUtils";
import { type Event } from "@/lib/schemas/events/event";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function DesktopLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const {
    items: events,
    error,
    isLoading,
    isValidating,
  } = useInfiniteScroll<Event>(eventListRef, "/api/events");
  const [search, setSearch] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "All"
  >("All");

  if (error) {
    toast.error("Could not get events");
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center">
        <CubeLoader size={32} />
        <p>Loading events...</p>
      </div>
    );
  }

  const filtered = filterEvents(
    events,
    search,
    selectedCategory === "All" ? null : selectedCategory,
    location
  );

  return (
    <div
      ref={eventListRef}
      className="flex-1 overflow-y-auto scrollbar-hide"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 space-y-8">
        {/* Hero Section - What's on this week */}
        <EventsHeroSection events={events} />

        {/* All Events Section */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-black">All Events</h2>

          <EventGridFilters
            search={search}
            setSearch={setSearch}
            location={location}
            setLocation={setLocation}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <p className="text-sm text-gray-400">
            Viewing {filtered.length} of {events.length} results
          </p>

          {/* Event Grid - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <EventGridCard key={event.id} event={event} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              No events found.
            </div>
          )}

          {isValidating && (
            <div className="flex justify-center py-4">
              <CubeLoader size={32} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
