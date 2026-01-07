import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import { HostedEvent } from "@/types/events/event";
import useSWR from "swr";

interface EventDetailPanelProps {
  event: HostedEvent;
  onBack?: () => void;
}

export function EventDetailPanel({ event, onBack }: EventDetailPanelProps) {
  const {
    data: creator,
    error: creatorError,
    isLoading: isLoadingCreator,
  } = useSWR(
    event.creator_profile_id ? `/api/users/${event.creator_profile_id}` : null,
    (url) => fetch(url).then((res) => res.json())
  );

  const {
    data: collaborators,
    error: collaboratorError,
    isLoading: isLoadingCollaborators,
  } = useSWR(event.id ? `/api/events/${event.id}/collaborators` : null, (url) =>
    fetch(url).then((res) => res.json())
  );

  let organiserString = "";
  if (!isLoadingCollaborators && !isLoadingCreator) {
    const collaboratorNames = collaborators.map(
      (collaborator: { first_name: string }) => collaborator.first_name
    );
    const formatted = collaboratorNames.join(", ");
    organiserString = `${creator.full_name}, ${formatted}`;
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

      {/* Header with Logo */}
      <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        <div className="flex flex-row items-center sm:items-start gap-6">
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-shrink-0 border-2 border-white/20 bg-secondary shadow-lg shadow-black/10 mx-auto sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              {event.thumbnailUrl ? (
                <Image
                  src={event.thumbnailUrl}
                  alt={`${event.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain max-h-16 sm:max-h-20 drop-shadow-lg"
                />
              ) : (
                <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-white/80" />
              )}
            </div>
          </div>
          <div className="flex-1 text-left min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
              {event.name}
            </h1>
            <div className="flex flex-col gap-1">
              {/* organiser information */}
              <span className="text-muted text-sm md:text-md">
                {isLoadingCreator || isLoadingCollaborators ? (
                  <p>Fetching organisers...</p>
                ) : creatorError || collaboratorError ? (
                  <p>Hosted By: Unknown</p>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Hosted By: {organiserString || "Unknown"}
                  </motion.div>
                )}
              </span>
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <Calendar className="size-4" />
                {new Date(event.start).toLocaleDateString()} -{" "}
                {new Date(event.end).toLocaleDateString()}
              </p>
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <Clock className="size-4" />
                {new Date(event.start).toLocaleTimeString([], {
                  timeStyle: "short",
                })}{" "}
                -{" "}
                {new Date(event.end).toLocaleTimeString([], {
                  timeStyle: "short",
                })}
              </p>

              {/* event location */}
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <MapPin className="size-4 text-muted" />
                {event.city
                  .map(
                    (city) =>
                      city.charAt(0).toUpperCase() +
                      city.replace("-", " ").slice(1)
                  )
                  .join(", ")}
                {" | "}
                {event.location_type === "virtual" ? "Online" : "In-Person"}
              </p>

              {/* event pricing */}
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <DollarSign className="size-4 text-muted" />
                {event.pricing === "free" ? "Free" : "Paid"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">About</h2>
        <p className="leading-relaxed text-sm sm:text-base text-muted">
          {event.description}
        </p>
      </div>

      {/* Event Details */}
      <div className="space-y-4 mb-6">
        {/* Booking Links */}
        {event.booking_link && event.booking_link.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {" "}
              Booking Links
            </h2>
            <div className="space-y-2">
              {event.booking_link.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-foreground hover:bg-foreground/60 border border-white/10 transition-all shadow-sm hover:shadow-md"
                >
                  <LinkIcon className="w-4 h-4 text-white/60" />
                  <span className="text-white/90 text-sm sm:text-base truncate">
                    {link}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
