import { motion } from "framer-motion";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import AddEventButton from "./AddEventButton";
import { useRef } from "react";
import { HostedEvent } from "@/types/events/event";
import { CubeLoader } from "@/components/ui/CubeLoader";
import ProfileEventListCard from "./ProfileEventListCard";


interface EventsSectionProps {
  userId: string;
}

export default function EventsSection({ userId }: EventsSectionProps) {
  const eventDisplayRef = useRef<HTMLDivElement | null>(null);
  const { items: events, error, isLoading, isValidating } = useInfiniteScroll<HostedEvent>(eventDisplayRef, `/api/users/${userId}/events`);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-32">
        <CubeLoader size={60} />
        <span className="text-white/70">Loading events...</span>
      </div>
    );
  }

  console.log(events);

  return (
    <motion.div
      className="relative max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="space-y-6">
        <AddEventButton />
        <div className="h-96">
          <div className="flex flex-col overflow-y-auto p-5 space-y-3 scrollbar-hide h-5/6" ref={eventDisplayRef}>
          {events.map((event, i) => {
            return (
              <ProfileEventListCard key={i} index={i}  event={event} />
            )
          })}
          { isValidating && <p>Loading...</p>}
        </div>
        </div>
        
      </div>
    </motion.div>  
  );
}