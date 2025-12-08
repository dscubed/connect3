import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react";
import EventsHeader from "@/components/events/HeaderSection";
import EventFilters from "@/components/events/EventFilters";
import { EventListCard } from "@/components/events/EventListCard";
import { EventCategory, HostedEvent } from "@/types/events/event";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { filterEvents } from "@/lib/events/eventUtils";
import { toast } from "sonner";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function MobileLayout() {
  const eventListRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { items: events, error, isLoading, isValidating } = useInfiniteScroll<HostedEvent>(eventListRef, "/api/events");
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [selectedEvent, setSelectedEvent] = useState<HostedEvent | null>(null);

  const handleEventSelect = (event: HostedEvent) => {
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
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black">
        <CubeLoader size={32} />
        <p>Loading events...</p>
      </div> 
    )
  }

  const filtered = filterEvents(events, search, selectedCategory === "All" ? null : selectedCategory);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showDetails ? (
            <motion.div
              key="list"
              initial={ { opacity: 0, x: -20 }}
              animate={ { opacity: 1, x: 0 } }
              exit={ { opacity: 0, x: -20 } }
              className="h-full flex flex-col bg-black/50 backdrop-blur-sm"
            >
              <EventsHeader eventCount={events.length} isLoading={isValidating} />
              <EventFilters
                search={search}
                setSearch={setSearch}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <div className="flex-1 overflow-y-auto  p-4 sm:p-5 space-y-3 scrollbar-hide" ref={eventListRef}>
                {filtered.map((event: HostedEvent) => (
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
                {
                  selectedEvent && 
                  <EventDetailPanel
                    event={selectedEvent}
                    onBack={handleBackToList}
                  />
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>         
    </div>
  ) 
}