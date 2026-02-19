"use client";
import EventsHeroSection from "@/components/events/EventsHeroSection";
import EventGridFilters, {
  type DateFilter,
  type TagFilter,
} from "@/components/events/EventGridFilters";
import { EventGridCard, EventGridCardSkeleton } from "@/components/events/EventGridCard";
import { useEffect, useMemo, useRef, useState } from "react";

import { type Event } from "@/lib/schemas/events/event";
import { toast } from "sonner";
import useSWR from "swr";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { AnimatePresence, motion } from "framer-motion";

const CATEGORY_OPTIONS = [
  "All", "competition", "fun", "miscellaneous", "networking", "panel", "study", "workshop",
];

const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://connect3.app";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DesktopLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [tagFilter, setTagFilter] = useState<TagFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (dateFilter !== "all") params.dateFilter = dateFilter;
    if (tagFilter !== "all") params.tagFilter = tagFilter;
    return params;
  }, [debouncedSearch, selectedCategory, dateFilter, tagFilter]);

  const {
    items: events,
    error,
    isLoading,
    isValidating,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<Event>(eventListRef, "/api/events", { queryParams });

  const { data: thisWeekData, isLoading: isLoadingThisWeek } = useSWR<{ items: Event[] }>(
    `${baseUrl}/api/events?dateFilter=this-week&limit=10`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const thisWeekEvents = thisWeekData?.items ?? [];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

  const seenIds = new Set<string>();
  const deduped = events.filter((event) => {
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
          <EventsHeroSection events={thisWeekEvents} isLoading={isLoadingThisWeek} onEventClick={setSelectedEvent} />

          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-black">All Events</h2>

            <EventGridFilters
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryOptions={CATEGORY_OPTIONS}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
            />

            <p className="text-sm text-gray-400">
              Viewing {deduped.length} of {events.length} results
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <EventGridCardSkeleton key={i} />)
                : deduped.map((event, index) => (
                    <EventGridCard
                      key={`${event.id}-${index}`}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                    />
                  ))}
            </div>

            {!isLoading && deduped.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">
                No events found.
              </div>
            )}

            {hasMore && deduped.length > 0 && <div ref={sentinelRef} className="h-1 w-full" aria-hidden />}

            {isValidating && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 18 }).map((_, i) => <EventGridCardSkeleton key={`skel-${i}`} />)}
              </div>
            )}
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
              <div className="relative h-full overflow-y-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors rounded-full shadow-sm"
                >
                  ✕
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
