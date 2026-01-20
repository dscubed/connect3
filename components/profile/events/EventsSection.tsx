import { motion } from "framer-motion";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useRef } from "react";
import { HostedEvent } from "@/types/events/event";
import { CubeLoader } from "@/components/ui/CubeLoader";
import ProfileEventListCard from "./ProfileEventListCard";
import { useAuthStore } from "@/stores/authStore";

export default function EventsSection() {
  const { user } = useAuthStore();

  const eventDisplayRef = useRef<HTMLDivElement | null>(null);
  const {
    items: events,
    isLoading,
    isValidating,
  } = useInfiniteScroll<HostedEvent>(
    eventDisplayRef,
    user ? `/api/users/${user.id}/events` : null,
  );
  if (!user) return;
  if (isLoading) {
    return (
      <div>
        <CubeLoader size={60} />
        <span className="text-muted">Loading events...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="relative max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="space-y-6">
        <div className="h-96">
          <div
            className="flex flex-col overflow-y-auto p-5 space-y-3 scrollbar-hide h-5/6"
            ref={eventDisplayRef}
          >
            {events.length === 0 && !isValidating ? (
              <p className="text-muted">No events hosted yet.</p>
            ) : (
              <>
                {events.map((event, i) => {
                  return (
                    <ProfileEventListCard key={i} index={i} event={event} />
                  );
                })}
              </>
            )}
            {isValidating && <p>Loading...</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
