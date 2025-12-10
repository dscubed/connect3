import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { HostedEvent } from "@/types/events/event";

export function EventListCard({
  event,
  isSelected,
  onClick,
}: {
  event: HostedEvent;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl sm:rounded-2xl border transition-all duration-300 ${
        isSelected
          ? "bg-white/[0.08] border-white/20 shadow-xl shadow-black/10"
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15 hover:shadow-lg hover:shadow-black/5"
      }`}
    >
      <div className="p-3 sm:p-5 flex items-start gap-3 sm:gap-4">
        {/* Logo */}
        <div
          className={`rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0 border ${
            isSelected
              ? "border-white/25 bg-white/5"
              : "border-white/15 bg-white/[0.02]"
          }`}
        >
          <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
            {event.thumbnailUrl ? (
              <Image
                src={event.thumbnailUrl || "/placeholder.png"}
                alt={`${event.name} logo`}
                width={48}
                height={48}
                className="object-contain max-h-8 sm:max-h-12 rounded-md grayscale"
              />
            ) : (
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-white/80" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm sm:text-base mb-1 sm:mb-1.5 truncate">
            {event.name}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            { new Date(event.start).toLocaleDateString() } - { new Date(event.end).toLocaleDateString() }
          </p>
        </div>
      </div>
    </motion.div>
  );
}
