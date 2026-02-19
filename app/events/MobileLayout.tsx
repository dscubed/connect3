import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import EventGridFilters, {
  type DateFilter,
  type TagFilter,
} from "@/components/events/EventGridFilters";
import { EventGridCard, EventGridCardSkeleton } from "@/components/events/EventGridCard";
import { type Event } from "@/lib/schemas/events/event";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const CATEGORY_OPTIONS = [
  "All", "competition", "fun", "miscellaneous", "networking", "panel", "study", "workshop",
];

export default function MobileLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
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

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showDetails ? (
            <motion.div
              key="list"
              ref={eventListRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto scrollbar-hide"
            >
              <div className="p-4 space-y-8 bg-white">
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

                  <div className="space-y-6">
                    {isLoading
                      ? Array.from({ length: 6 }).map((_, i) => <EventGridCardSkeleton key={i} />)
                      : deduped.map((event: Event, index) => (
                          <EventGridCard
                            key={`${event.id}-${index}`}
                            event={event}
                            onClick={() => handleEventSelect(event)}
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
                    <div className="space-y-6">
                      {Array.from({ length: 18 }).map((_, i) => <EventGridCardSkeleton key={`skel-${i}`} />)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full bg-white overflow-hidden"
            >
              <div className="h-full overflow-y-auto scrollbar-hide">
                {selectedEvent && (
                  <EventDetailPanel
                    event={selectedEvent}
                    onBack={handleBackToList}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
