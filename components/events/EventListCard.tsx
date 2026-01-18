import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { type Event } from "@/lib/schemas/events/event";
import useSWR from "swr";

export function EventListCard({
  event,
  isSelected,
  onClick,
}: {
  event: Event;
  isSelected: boolean;
  onClick: () => void;
}) {
  const {
    data: creator,
    error: creatorError,
    isLoading: isLoadingCreator,
  } = useSWR(
    `/api/users/${event.creatorProfileId}`,
    (url) => fetch(url).then((res) => res.json())
  );

  if (isLoadingCreator) return;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl sm:rounded-2xl border transition-all duration-300 ${
        isSelected
          ? "bg-primary border-white/20 shadow-xl shadow-black/10"
          : " border-muted/20 hover:bg-primary/80 hover:shadow-lg hover:shadow-black/5"
      }`}
    >
      <div className="p-3 sm:p-5 flex items-start gap-3 sm:gap-4">
        
        {/* Logo */}
        <div
          className={`w-12 md:w-20 aspect-square rounded-lg sm:rounded-xl flex justify-center items-center border ${
            isSelected
              ? "border-white bg-foreground/50"
              : "border-white bg-muted"
          }`}
        >
          {!isLoadingCreator ? (
            <Image
              src={creator.avatar_url}
              alt={`${event.name} logo`}
              width={128}
              height={128}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-white/80" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-secondary-foreground  font-semibold text-sm sm:text-base mb-1 sm:mb-1.5 truncate">
            {event.name}
          </h3>

          <span className="text-foreground text-sm md:text-md font-semibold">
            {isLoadingCreator ? (
              <p>Fetching organisers...</p>
            ) : creatorError ? (
              <p>Unknown</p>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {creator.full_name || "Unknown"}
              </motion.p>
            )}
          </span>
          
          {/* Event details */}
          <div className="space-y-1">
            <p className="text-muted text-xs sm:text-sm line-clamp-1 leading-relaxed flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(event.start).toLocaleDateString()} -{" "}
              {new Date(event.end).toLocaleDateString()}
            </p>
            
            {/* <p className="text-white/50 text-xs sm:text-sm line-clamp-1 leading-relaxed flex items-center gap-1">
              {!event.isOnline ? <MapPin className="size-3" /> : <Globe className="size-3" />}
              {!event.isOnline 
                ? `${event.location.venue}, ${event.location.city}` 
                : "Online"}
            </p>
            
            <p className="text-white/50 text-xs sm:text-sm line-clamp-1 leading-relaxed flex items-center gap-1">
              <Users className="size-3" />
              Capacity: {event.capacity}
            </p>
            
            <p className="text-white/50 text-xs sm:text-sm line-clamp-1 leading-relaxed">
              {event.category.type} - {event.category.category}
            </p> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
