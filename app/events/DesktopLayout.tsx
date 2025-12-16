"use client";
import { AnimatePresence } from "framer-motion";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import EventsHeader from "@/components/events/HeaderSection";
import EventFilters from "@/components/events/EventFilters";
import { EventListCard } from "@/components/events/EventListCard";
import { EventCategory, HostedEvent } from "@/types/events/event";
import { useEffect, useRef, useState } from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { filterEvents } from "@/lib/events/eventUtils";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function DesktopLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const { items: events, error, isLoading, isValidating } = useInfiniteScroll<HostedEvent>(eventListRef, "/api/events");
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

  if (error) {
    toast.error("Could not get events");
  }

  if (isLoading) {
    return ( 
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black">
        <CubeLoader size={32} />
        <p>Loading events...</p>
      </div> 
    )
  }

  // perform event filtering by name and category
  const filtered = filterEvents(events, search, selectedCategory === "All" ? null : selectedCategory);

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
          {filtered.map((event) => (
            <EventListCard 
              key={event.id}
              event={event} 
              isSelected={ selectedEvent ? selectedEvent.id === event.id : false}
              onClick={() => handleEventSelect(event)}
            />
          ))}
                  
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-white/60">
              No events found.
            </div>
          )} 

          { isValidating && <div className="flex justify-center">
            <CubeLoader size={32} />
          </div> }
        </div>
      </div>

      {/* Right Panel - Event Details */}
      <div className="flex-1 bg-black overflow-hidden">
        <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {selectedEvent && <EventDetailPanel event={selectedEvent} /> }
          </AnimatePresence>
        </div>
      </div>
    </div> 
  )
}