"use client";
import { AnimatePresence } from "framer-motion";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import EventsHeader from "@/components/events/HeaderSection";
import EventFilters from "@/components/events/EventFilters";
import { EventListCard } from "@/components/events/EventListCard";
import { EventCategory, HostedEvent } from "@/types/events/event";
import { useEventsWithInfiniteScroll } from "@/hooks/useEventsWithInfiniteScroll";
import { useEffect, useRef, useState } from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";

export default function DesktopLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const { events, error, isLoading, isValidating } = useEventsWithInfiniteScroll(eventListRef);
  const [selectedEvent, setSelectedEvent] = useState<HostedEvent | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    // on initial load set the selected event to be the first in the data
    // upon further loads do not set the selected event
    if (!loaded && !isLoading) {
      setSelectedEvent(events[0]);
      setLoaded(true);
    }
  }, [isLoading, events, loaded]);

  const handleEventSelect = (event: HostedEvent) => {
    setSelectedEvent(event);
  };

  if (isLoading) {
    return ( 
      <div className="min-h-screen flex flex-col justify-center items-center bg-black">
        <CubeLoader size={32} />
        <p>Loading events...</p>
      </div> 
    )
  }

  // perform better filtering by name
  const filtered = events.filter(event => {
    const searchPredicate = search.trim() === "" ||
     event.name.toLowerCase().includes(search.toLowerCase())
    return searchPredicate
  }).map(event => ({ ...event, weight: event.name.toLowerCase().indexOf(search.toLowerCase())}))
  .sort((a, b) => a.weight - b.weight);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel - Event List */}
      <div className="w-80 xl:w-96 border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex flex-col">
        <EventsHeader eventCount={events.length} isLoading={isValidating} />
        <EventFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide" ref={eventListRef}>
          {filtered.map((event: HostedEvent) => (
            <EventListCard 
              key={event.id}
              event={event} 
              isSelected={ selectedEvent ? selectedEvent.id === event.id : false}
              onClick={() => handleEventSelect(event)}
            />
          ))}

          {/* {filteredClubs.map((club) => (
            <ClubListCard
              key={club.id}
              club={club}
              isSelected={selectedClub.id === club.id}
              onClick={() => setSelectedClub(club)}
            />
          ))}
          {filteredClubs.length === 0 && (
            <div className="p-4 text-sm text-white/60">
              No clubs match your search / filter.
            </div>
          )} */}

        </div>
      </div>

      {/* Right Panel - Event Details */}
      <div className="flex-1 bg-black overflow-hidden">
        <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <EventDetailPanel event={selectedEvent} />
          </AnimatePresence>
        </div>
      </div>
    </div> 
  )
}