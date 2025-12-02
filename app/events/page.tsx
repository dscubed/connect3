"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { EventCategory } from "@/types/events/event";
import Sidebar from "@/components/sidebar/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import EventsHeader from "@/components/events/HeaderSection";
import { HostedEvent } from "@/types/events/event";
import { EventListCard } from "@/components/events/EventListCard"; 
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import useSWRInfinite from "swr/infinite";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { Button } from "@/components/ui/button";
import EventFilters from "@/components/events/EventFilters";

interface EventsResponse {
  events: HostedEvent[];
  cursor: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getKey = (pageIndex: number, previousPageData: EventsResponse | null): string | null => {
  if (pageIndex === 0) {
    return process.env.NODE_ENV !== "production" ? 
      "http://localhost:3000/api/events?limit=10" : 
      "https://connect3.app/api/events?limit=10";
  }

  if (!previousPageData?.cursor ) return null;

  const encoded = encodeURIComponent(previousPageData.cursor);
  return process.env.NODE_ENV !== "production" ? 
    `http://localhost:3000/api/events?cursor=${encoded}&limit=10` : 
    `https://connect3.app/api/events?cursor=${encoded}&limit=10`;
}

export default function EventsPage() {
  const { data, 
          size, 
          setSize, 
          error, 
          isValidating, 
          isLoading } = useSWRInfinite<EventsResponse>(getKey, fetcher);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HostedEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const eventListRef = useRef<HTMLDivElement>(null);

  // Search and category filter state
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">(
    "All"
  );

  const events: HostedEvent[] = data ? data.flatMap(page => page.events) : [];
  const isEmpty = data?.[0]?.events.length === 0;
  const noEventsLeft = isEmpty || (data && data[data.length - 1]?.events.length < 100);

  useEffect(() => {
    // on initial load set the selected event to be the first in the data
    // upon further loads do not set the selected event
    if (!loaded && !isLoading) {
      setSelectedEvent(events[0]);
      setLoaded(true);
    }
  }, [loaded, isLoading, events])


  const handleScroll = useCallback(() => {
    if (!eventListRef.current) {
      return;
    }

    const SCROLL_THRESHOLD = 5; // measured in pixels 
    const bottomPosition = Math.abs(eventListRef.current.scrollHeight - eventListRef.current.scrollTop);

    if (bottomPosition - eventListRef.current.clientHeight <= SCROLL_THRESHOLD && !isValidating) {
      // update once we scroll to the bottom and are not in the process of refetching / revalidating
      setSize(original => original + 1);
    }
  }, [eventListRef, setSize, isValidating]);

  // attach scroll event listener to event list once data loads
  useEffect(() => {
    if (isLoading) {
      return;
    }

    eventListRef.current?.addEventListener("scroll", handleScroll);
    const refCopy = eventListRef.current;
    return () => {
      if (refCopy) {
        refCopy.removeEventListener("scroll", handleScroll);
      }
    }
  }, [handleScroll, isLoading])

  const handleEventSelect = (event: HostedEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  if (isLoading) {
    return ( 
      <div className="min-h-screen flex flex-col justify-center items-center bg-black">
        <CubeLoader size={32} />
        <p>Loading events...</p>
      </div> 
    )
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile: Show either list or details */}
      <div className="lg:hidden  flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        {!showDetails ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col bg-black/50 backdrop-blur-sm"
          >
            {/* Header */}
            <EventsHeader eventCount={events.length} isLoading={isValidating} />

            {/* Search and Category Filter */}

            <EventFilters
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <div className="flex-1 overflow-y-auto  p-4 sm:p-5 space-y-3 scrollbar-hide" ref={eventListRef}>
              {events.map((event: HostedEvent) => (
                <EventListCard 
                  key={event.id}
                  event={event} 
                  isSelected={ selectedEvent ? selectedEvent.id === event.id : false}
                  onClick={() => handleEventSelect(event)}
                />
              ))}
            </div>
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
              <EventDetailPanel
                event={selectedEvent}
                onBack={handleBackToList}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Desktop: Side by side layout */}
    <div className="hidden lg:flex flex-1 overflow-hidden">
      {/* Left Panel - Club List */}
      <div className="w-80 xl:w-96 border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex flex-col">
        {/* Header */}
        <EventsHeader eventCount={events.length}  isLoading={isValidating} />
        {/* Search and Category Filter */}
        <EventFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide" ref={eventListRef}>
          {events.map((event: HostedEvent) => (
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

      {/* Right Panel - Club Details */}
      <div className="flex-1 bg-black overflow-hidden">
        <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <EventDetailPanel event={selectedEvent} />
          </AnimatePresence>
        </div>
      </div>
    </div>          
      </div>
    </div>
  );
}