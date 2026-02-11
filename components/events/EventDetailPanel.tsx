import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Users,
  Globe,
} from "lucide-react";
import { type Event } from "@/lib/schemas/events/event";
import useSWR from "swr";
import parse from "html-react-parser";

interface EventDetailPanelProps {
  event: Event;
  onBack?: () => void;
}

export function EventDetailPanel({ event, onBack }: EventDetailPanelProps) {
  const {
    data: creator,
    error: creatorError,
    isLoading: isLoadingCreator,
  } = useSWR(`/api/users/${event.creatorProfileId}`, (url) =>
    fetch(url).then((res) => res.json()),
  );

  let organiserString = "";
  console.log(event.pricing);
  if (!isLoadingCreator) {
    console.log(creator);
    organiserString = creator ? creator.full_name : "Unknown";
  }

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto scrollbar-hide"
    >
      {/* Mobile Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden mt-12 flex items-center gap-2 text-white/60 hover:text-white mb-4 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back to events</span>
        </button>
      )}

      {/* Header with image and event details */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        {/* Image container with square aspect ratio */}
        {event.thumbnail ? 
          <div
            className="relative rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 w-full sm:w-64 aspect-square"
            style={{
              backgroundImage: event.thumbnail ? `url(${event.thumbnail})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
         :
           <div
            className="flex justify-center items-center relative rounded-xl sm:rounded-2xl w-full sm:w-80 aspect-square bg-background " 
            >
              <p className="text-foreground">Image not Found</p>
         </div> 
        }
        

        {/* Event details */}
        <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight text-secondary-foreground">
            {event.name}
          </h1>
          <div className="flex flex-col gap-1 text-muted">
            {/* organiser information */}
            <span className="text-sm md:text-md">
              {isLoadingCreator ? (
                <p>Fetching organisers...</p>
              ) : creatorError ? (
                <p>Hosted By: Unknown</p>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Hosted By: {organiserString || "Unknown"}
                </motion.div>
              )}
            </span>

            {/* Event dates */}
            <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center text-muted">
              <Calendar className="size-4 text-foreground/80" />
              {new Date(event.start).toLocaleDateString()} -{" "}
              {new Date(event.end).toLocaleDateString()}
            </p>
            <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
              <Clock className="size-4 text-foreground/80" />
              {new Date(event.start).toLocaleTimeString([], {
                timeStyle: "short",
              })}{" "}
              -{" "}
              {new Date(event.end).toLocaleTimeString([], {
                timeStyle: "short",
              })}
            </p>

            {/* Event capacity */}
            {
              event.capacity && (
                <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center text-muted">
                  <Users className="size-4 text-foreground/80" />
                  Capacity: {event.capacity}
                </p>
              ) 
            }
            

            {/* Currency */}
            <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
              <DollarSign className="size-4 text-foreground/80" />
              {event.pricing.min === 0 && event.pricing.max === 0
                ? "Free"
                : `${event.pricing.min} - ${event.pricing.max}`}
            </p>

            {/* Online/In-person */}
            <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
              {event.isOnline ? (
                <Globe className="size-4 text-foreground/80" />
              ) : (
                <MapPin className="size-4 text-foreground/80" />
              )}
              {event.isOnline ? "Online" : "In-Person"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
        <h2 className="text-lg mb-3 sm:mb-4 font-bold rounded-2xl">About</h2>
        <span className="leading-relaxed text-sm sm:text-base text-muted">
          {parse(event.description || "No description provided.")}
        </span>
      </div>

      <div className="flex border border-foreground/20 rounded-xl sm:rounded-2xl">
        {/* Location Details */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6 w-1/2">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Location
          </h2>
          {event.isOnline ? (
            <p>Event is Online</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-muted flex items-center gap-2">
                <MapPin className="size-4" />
                <span>Venue: {event.location.venue}</span>
              </p>
              <p className="text-sm sm:text-base text-muted flex items-center gap-2">
                <MapPin className="size-4" />
                <span>Address: {event.location.address}</span>
              </p>
              <p className="text-sm sm:text-base text-muted flex items-center gap-2">
                <MapPin className="size-4" />
                <span>
                  Location: {event.location.city}, {event.location.country}
                </span>
              </p>
            </div>
          )}
        </div>
        {/* Event Details */}
        <div className="space-y-4 mb-6 w-1/2">
          {/* Booking Link */}
          {event.bookingUrl && (
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                Links
              </h2>
              <div className="space-y-2">
                <a
                  href={event.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between  border border-muted/20
                  p-3 sm:p-4 rounded-lg sm:rounded-xl
                  hover:bg-card transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted" />
                    <span className="text-muted text-sm sm:text-base truncate">
                      Humanitix
                    </span>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
