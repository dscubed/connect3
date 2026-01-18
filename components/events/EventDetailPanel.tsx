import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Users,
  Globe,
  Hash,
} from "lucide-react";
import { type Event } from "@/lib/schemas/events/event";
import useSWR from "swr";
import parse from 'html-react-parser'; 

interface EventDetailPanelProps {
  event: Event;
  onBack?: () => void;
}

export function EventDetailPanel({ event, onBack }: EventDetailPanelProps) {
  console.log(event.category)
  const {
    data: creator,
    error: creatorError,
    isLoading: isLoadingCreator,
  } = useSWR(
    `/api/users/${event.creatorProfileId}`,
    (url) => fetch(url).then((res) => res.json())
  );

  let organiserString = "";
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

      {/* Header with Logo */}
      <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        <div className="flex flex-row items-center sm:items-start gap-6">
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-shrink-0 border-2 border-white/20 bg-secondary shadow-lg shadow-black/10 mx-auto sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              {event.thumbnail ? (
                <Image
                  src={event.thumbnail}
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

              {/* Event capacity */}
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <Users className="size-4" />
                Capacity: {event.capacity}
              </p>

              {/* Currency */}
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <DollarSign className="size-4" />
                Currency: {event.currency}
              </p>

              {/* Online/In-person */}
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                {event.isOnline ? <Globe className="size-4" /> : <MapPin className="size-4" />}
                {event.isOnline ? "Online" : "In-Person"}
              </p>

              {/* Category */}
              <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed flex gap-1 items-center">
                <Hash className="size-4" />
                {event.category.type} - {event.category.category} ({event.category.subcategory})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">About</h2>
        <span className="leading-relaxed text-sm sm:text-base text-muted">
          { parse(event.description || "No description provided.")}
        </span>
      </div>

      {/* Location Details */}
      {!event.isOnline && (
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Location</h2>
          <div className="space-y-2">
            <p className="text-sm sm:text-base text-muted flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{event.location.venue}</span>
            </p>
            <p className="text-sm sm:text-base text-muted flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{event.location.address}</span>
            </p>
            <p className="text-sm sm:text-base text-muted flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{event.location.city}, {event.location.country}</span>
            </p>
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="space-y-4 mb-6">
        {/* Booking Link */}
        {event.bookingUrl && (
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Booking</h2>
            <div className="space-y-2">
              <a
                href={event.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-foreground hover:bg-foreground/60 border border-white/10 transition-all shadow-sm hover:shadow-md"
              >
                <LinkIcon className="w-4 h-4 text-white/60" />
                <span className="text-white/90 text-sm sm:text-base truncate">
                  {event.bookingUrl}
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Published At */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Published</h2>
          <p className="text-sm sm:text-base text-muted">
            {new Date(event.publishedAt).toLocaleString()}
          </p>
        </div>

        {/* Additional Details */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Additional Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Event ID</p>
              <p className="text-sm sm:text-base text-white">{event.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Creator Profile ID</p>
              <p className="text-sm sm:text-base text-white">{event.creatorProfileId}</p>
            </div>
            {event.openaiFileId && (
              <>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">AI File ID</p>
                  <p className="text-sm sm:text-base text-white">{event.openaiFileId}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
 );
}
