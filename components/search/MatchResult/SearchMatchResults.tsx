"use client";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import { EntityResult, EntityType } from "@/lib/search/types";
import { cn } from "@/lib/utils";
import { useEntityCache } from "../hooks/useEntityCache";
import { useEventCache } from "../hooks/useEventCache";
import { Calendar, MapPin, Globe } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_COLORS: Record<EntityType, string> = {
  user: "bg-blue-50/50   border-blue-100",
  organisation: "bg-violet-50/50 border-violet-100",
  events: "bg-rose-50/50   border-rose-100",
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface SearchMatchResultsProps {
  match: EntityResult;
  userIndex: number;
  onProfileClick?: (entity: EntityResult) => void;
}

export default function SearchMatchResults({
  match,
  userIndex,
  onProfileClick,
}: SearchMatchResultsProps) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * userIndex }}
    >
      {match.type === "events" ? (
        <EventRow match={match} onProfileClick={onProfileClick} />
      ) : (
        <ProfileRow match={match} onProfileClick={onProfileClick} />
      )}
    </motion.div>
  );
}

/* ── Profile row (user & organisation) ────────────────────────────────────── */

function ProfileRow({
  match,
  onProfileClick,
}: {
  match: EntityResult;
  onProfileClick?: (e: EntityResult) => void;
}) {
  const profile = useEntityCache(match.id, match.type);

  if (profile === undefined) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border p-4",
          CARD_COLORS[match.type],
        )}
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      </div>
    );
  }

  const name =
    profile?.account_type === "organisation"
      ? profile.first_name
      : `${profile?.first_name} ${profile?.last_name}`;

  return (
    <button
      className={cn(
        "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:brightness-95",
        CARD_COLORS[match.type],
      )}
      onClick={() => onProfileClick?.(match)}
    >
      {/* Left column: name + description */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-semibold text-sm text-secondary-foreground/80 truncate">
          {name || "User"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {profile?.tldr || "No profile summary available."}
        </p>
      </div>
      {/* Right column: avatar */}
      <UserAvatar
        avatarUrl={profile?.avatar_url || ""}
        fullName={name || ""}
        userId={match.id}
        isOrganisation={match.type === "organisation"}
        size="md"
      />
    </button>
  );
}

/* ── Event row ────────────────────────────────────────────────────────────── */

function EventRow({
  match,
  onProfileClick,
}: {
  match: EntityResult;
  onProfileClick?: (e: EntityResult) => void;
}) {
  const { event, isLoading } = useEventCache(match.id);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border p-4",
          CARD_COLORS.events,
        )}
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      </div>
    );
  }

  const formattedDate = event?.start
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(event.start))
    : null;

  return (
    <button
      className={cn(
        "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:brightness-95",
        CARD_COLORS.events,
      )}
      onClick={() => onProfileClick?.(match)}
    >
      {/* Left column: title + meta + description */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-semibold text-sm text-secondary-foreground/80 truncate">
          {event?.name || "Event"}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {formattedDate}
            </span>
          )}
          {event?.isOnline !== undefined && (
            <span className="flex items-center gap-1">
              {event.isOnline ? (
                <Globe className="w-3 h-3" aria-hidden="true" />
              ) : (
                <MapPin className="w-3 h-3" aria-hidden="true" />
              )}
              {event.isOnline ? "Online" : "In-Person"}
            </span>
          )}
        </div>
        {event?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {stripHtml(event.description)}
          </p>
        )}
      </div>
      {/* Right column: thumbnail */}
      {event?.thumbnail ? (
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={event.thumbnail}
            alt={event.name}
            fill
            sizes="48px"
            className="rounded-lg object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-rose-300" aria-hidden="true" />
        </div>
      )}
    </button>
  );
}
