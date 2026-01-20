import { motion } from "framer-motion";

interface HeaderSectionProps {
  eventCount: number;
  isLoading: boolean;
}

export default function EventsHeader({
  eventCount,
  isLoading,
}: HeaderSectionProps) {
  return (
    <div className="pl-20 sm:ml-0 border-b border-white/10 p-4 sm:p-6 lg:p-7 flex-shrink-0">
      <div className="flex items-center gap-3 mb-2 sm:mb-3">
        {/* Icon - hidden on mobile, shown on desktop */}
        <h1 className="text-xl sm:text-2xl font-bold">Events</h1>
      </div>
      <span className="text-muted text-xs sm:text-sm font-medium">
        {isLoading ? (
          <p>Loading events...</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {eventCount} events available
          </motion.div>
        )}
      </span>
    </div>
  );
}
