"use client";
import EventsHeroSection from "@/components/events/EventsHeroSection";
import EventGridFilters, {
  type DateFilter,
  type TagFilter,
} from "@/components/events/EventGridFilters";
import { EventGridCard } from "@/components/events/EventGridCard";
import { useEffect, useRef, useState } from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { filterEvents, getFeaturedEvents } from "@/lib/events/eventUtils";
import { type Event } from "@/lib/schemas/events/event";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { AnimatePresence, motion } from "framer-motion";

export default function DesktopLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const {
    items: events,
    error,
    isLoading,
    isValidating,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<Event>(eventListRef, "/api/events");
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [tagFilter, setTagFilter] = useState<TagFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key)
      if (event.key === "Escape") {
        setSelectedEvent(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

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

  const categoryOptions = [
    "All",
    ...Array.from(new Set(events.map((e) => e.category).filter(Boolean))).sort(),
  ];

  const featuredEvents = getFeaturedEvents(events);

  const filtered = filterEvents(
    events,
    search,
    selectedCategory === "All" ? null : selectedCategory,
    dateFilter,
    tagFilter,
  );

  // Deduplicate by event.id (keep first occurrence) to avoid duplicate key errors
  const seenIds = new Set<string>();
  const deduped = filtered.filter((event) => {
    if (seenIds.has(event.id)) return false;
    seenIds.add(event.id);
    return true;
  });

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        ref={eventListRef}
        className={`overflow-y-auto scrollbar-hide transition-all duration-300 ${
          selectedEvent ? "flex-1" : "flex-1"
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 space-y-8 bg-white z-30">
          <EventsHeroSection events={featuredEvents} onEventClick={setSelectedEvent} />

          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-black">All Events</h2>

            <EventGridFilters
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryOptions={categoryOptions}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
            />

            <p className="text-sm text-gray-400">
              Viewing {deduped.length} of {events.length} results
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {deduped.map((event, index) => (
                <EventGridCard
                  key={`${event.id}-${index}`}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>

            {deduped.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No events found.
              </div>
            )}

            {/* Sentinel for infinite scroll - must be inside scroll container */}
            {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden />}

            {/* Fixed-height loading area to prevent layout shift */}
            <div className="min-h-[64px] flex items-center justify-center py-4">
              {isValidating && <CubeLoader size={32} />}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden border-l border-gray-200"
            >
              <div className="relative h-full overflow-y-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-gray-900 transition-colors text-sm px-3 py-1.5 rounded-full shadow-sm"
                >
                  ✕ Close
                </button>
                <EventDetailPanel event={selectedEvent} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
