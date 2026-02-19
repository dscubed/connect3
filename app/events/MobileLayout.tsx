import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import EventsHeader from "@/components/events/HeaderSection";
import EventGridFilters, {
  type DateFilter,
  type TagFilter,
} from "@/components/events/EventGridFilters";
import { EventListCard } from "@/components/events/EventListCard";
import { type Event } from "@/lib/schemas/events/event";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { filterEvents } from "@/lib/events/eventUtils";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function MobileLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
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

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center bg-black">
        <CubeLoader size={32} />
        <p>Loading events...</p>
      </div>
    );
  }

  const categoryOptions = [
    "All",
    ...Array.from(new Set(events.map((e) => e.category).filter(Boolean))).sort(),
  ];

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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showDetails ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col backdrop-blur-sm"
            >
              <EventsHeader
                eventCount={events.length}
                isLoading={isValidating}
              />
              <div className="px-4 pt-4">
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
              </div>
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-hide"
                ref={eventListRef}
              >
                {deduped.map((event: Event, index) => (
                  <EventListCard
                    key={`${event.id}-${index}`}
                    event={event}
                    isSelected={
                      selectedEvent ? selectedEvent.id === event.id : false
                    }
                    onClick={() => handleEventSelect(event)}
                  />
                ))}
                {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden />}
                <div className="min-h-[64px] flex items-center justify-center py-4">
                  {isValidating && <CubeLoader size={32} />}
                </div>
              </div>
              {deduped.length === 0 && !isValidating && (
                <div className="p-4 text-sm text-white/60">
                  No events found.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full bg-black overflow-hidden"
            >
              <div className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-hide">
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
