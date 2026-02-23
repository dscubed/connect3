import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Globe,
  ExternalLink,
} from "lucide-react";
import { type Event } from "@/lib/schemas/events/event";
import Image from "next/image";
import useSWR from "swr";
import Markdown from "../ui/Markdown";

interface EventDetailPanelProps {
  event: Event;
  onBack?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold text-purple-600 border border-purple-300 bg-purple-50 rounded-full px-3 py-1 mb-3">
      {children}
    </span>
  );
}

function TagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${color}`}>
      {label}
    </span>
  );
}

function getEventTags(event: Event): { label: string; color: string }[] {
  const tags: { label: string; color: string }[] = [];
  if (event.pricing.min > 0 || event.pricing.max > 0) {
    tags.push({ label: "Paid", color: "bg-red-400" });
  } else {
    tags.push({ label: "Free", color: "bg-teal-500" });
  }
  if (!event.isOnline) {
    tags.push({ label: "In-person", color: "bg-blue-400" });
  } else {
    tags.push({ label: "Online", color: "bg-cyan-400" });
  }
  return tags;
}

export function EventDetailPanel({ event, onBack }: EventDetailPanelProps) {
  const {
    data: creator,
    error: creatorError,
    isLoading: isLoadingCreator,
  } = useSWR(`/api/users/${event.creatorProfileId}`, (url) =>
    fetch(url).then((res) => res.json()),
  );

  console.log("Event  ", event)

  const organiserString =
    !isLoadingCreator && !creatorError && creator
      ? creator.full_name
      : "Unknown";

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const tags = getEventTags(event);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -(startDate.getTimezoneOffset() / 60);
  const gmtLabel = `GMT${offset >= 0 ? "+" : ""}${offset}:00`;

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto scrollbar-hide"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden mt-12 flex items-center gap-2 text-white/60 hover:text-white mb-4 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back to events</span>
        </button>
      )}

      {/* Cover image header with gradient overlays */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src="/cover/cover-purple.png"
          alt="Cover"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/50" />
      </div>

      {/* Thumbnail + Participate overlapping cover */}
      <div className="relative px-5 -mt-14 pb-2 z-10">
        <div className="flex items-end justify-between">
          {event.thumbnail ? (
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow-md"
              style={{
                backgroundImage: `url(${event.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-md">
              <span className="text-purple-300 text-xs">No Image</span>
            </div>
          )}
          {event.bookingUrl && (
            <a
              href={event.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              Participate <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Title & Organiser */}
      <div className="px-5 pb-4">
        <h1 className="text-xl font-bold text-secondary-foreground leading-tight mt-3">
          {event.name}
        </h1>
        <p className="text-sm text-muted mt-1">
          {isLoadingCreator ? "Loading..." : organiserString}
        </p>
      </div>

      {/* Description */}
      <div className="mx-5 bg-purple-50/50 border border-purple-100 rounded-2xl p-4 mb-4">
        <SectionLabel>Description</SectionLabel>
        <div className="text-sm text-muted leading-relaxed">
          <Markdown rawText={event.description || "No description provided."} />
        </div>
        {event.source === "instagram" && (
          <a
            href={`https://www.instagram.com/p/${event.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            View on Instagram <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Duration */}
      <div className="mx-5 border border-purple-100 rounded-2xl p-4 mb-4">
        <SectionLabel>Duration</SectionLabel>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-muted w-12">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                Start
              </span>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-md w-24 text-center">
                {formatDate(startDate)}
              </span>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-md w-20 text-center">
                {formatTime(startDate)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-muted w-12">
                <span className="w-2 h-2 border border-muted rounded-full" />
                End
              </span>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-md w-24 text-center">
                {formatDate(endDate)}
              </span>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-md w-20 text-center">
                {formatTime(endDate)}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-center">
            <Globe className="w-5 h-5 text-muted mx-auto mb-1" />
            <p className="text-xs font-medium">{gmtLabel}</p>
            <p className="text-[10px] text-muted">{tz.split("/").pop()}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mx-5 border border-purple-100 rounded-2xl p-4 mb-4">
        <SectionLabel>Location</SectionLabel>
        {event.isOnline ? (
          <p className="text-sm text-muted flex items-center gap-2">
            <Globe className="w-4 h-4" /> Online Event
          </p>
        ) : (
          <p className="text-sm text-muted flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            {[event.location.venue, event.location.city].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      {/* Links */}
      {event.bookingUrl && (
        <div className="mx-5 border border-purple-100 rounded-2xl p-4 mb-4">
          <SectionLabel>Links</SectionLabel>
          <div className="space-y-2">
            <a
              href={event.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors py-1.5"
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              Official Website
            </a>
          </div>
        </div>
      )}

      {/* Categories */}
      {event.category && (
        <div className="mx-5 border border-purple-100 rounded-2xl p-4 mb-4">
          <SectionLabel>Categories</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <TagBadge label={event.category.split(/[_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} color="bg-purple-500" />
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mx-5 border border-purple-100 rounded-2xl p-4 mb-6">
          <SectionLabel>Tags</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <TagBadge key={i} label={tag.label} color={tag.color} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
