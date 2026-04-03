"use client";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import { EntityResult, EntityType } from "@/lib/search/types";
import { cn } from "@/lib/utils";
import { useEntityCache } from "../hooks/useEntityCache";
import { useEventCache } from "../hooks/useEventCache";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Globe } from "lucide-react";
import Image from "next/image";
import Markdown from "@/components/ui/Markdown";
import { Skeleton } from "@/components/ui/skeleton";

// ── Config map: one place to update per entity type ──────────────────────────

const CARD_COLORS: Record<EntityType, string> = {
  user: "bg-blue-50   border-blue-200   hover:bg-blue-100",
  organisation: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  events: "bg-rose-50   border-rose-200   hover:bg-rose-100",
};

const CARD_BASE =
  "cursor-pointer shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main component ────────────────────────────────────────────────────────────

interface MatchResultsProps {
  match: EntityResult;
  userIndex: number;
  onProfileClick?: (entity: EntityResult) => void;
}

export default function MatchResults({
  match,
  userIndex,
  onProfileClick,
}: MatchResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + userIndex * 0.2 }}
    >
      {match.type === "events" ? (
        <EventCardContent match={match} onProfileClick={onProfileClick} />
      ) : (
        <ProfileCardContent match={match} onProfileClick={onProfileClick} />
      )}
    </motion.div>
  );
}

// ── Profile card (user & organisation) ───────────────────────────────────────

function ProfileCardContent({
  match,
  onProfileClick,
}: {
  match: EntityResult;
  onProfileClick?: (e: EntityResult) => void;
}) {
  const profile = useEntityCache(match.id, match.type);

  if (profile === undefined) {
    return (
      <Card
        className={cn(
          "w-56 md:w-60 lg:w-80 max-h-40 shadow-none",
          CARD_COLORS[match.type],
        )}
      >
        <CardHeader className="flex flex-row gap-2 items-center p-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-5 flex-1 rounded-md" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-3/4 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const name =
    profile?.account_type === "organisation"
      ? profile.first_name
      : `${profile?.first_name} ${profile?.last_name}`;

  return (
    <Card
      className={cn(
        "w-56 md:w-60 lg:w-80 max-h-40",
        CARD_BASE,
        CARD_COLORS[match.type],
      )}
      onClick={() => onProfileClick?.(match)}
      onKeyDown={(e) => e.key === "Enter" && onProfileClick?.(match)}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="flex flex-row gap-2 items-center p-4">
        <UserAvatar
          avatarUrl={profile?.avatar_url || ""}
          fullName={name || ""}
          userId={match.id}
          isOrganisation={match.type === "organisation"}
        />
        <span className="font-medium text-base lg:text-lg flex-1 !m-0 truncate text-secondary-foreground">
          {name || "User"}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <span className="text-sm text-muted-foreground line-clamp-3">
          <Markdown
            rawText={profile?.tldr || "No profile summary available."}
          />
        </span>
      </CardContent>
    </Card>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCardContent({
  match,
  onProfileClick,
}: {
  match: EntityResult;
  onProfileClick?: (e: EntityResult) => void;
}) {
  const { event, isLoading } = useEventCache(match.id);

  if (isLoading) {
    return (
      <Card
        className={cn(
          "w-56 md:w-60 lg:w-80 max-h-48 shadow-none",
          CARD_COLORS.events,
        )}
      >
        <CardHeader className="flex flex-row gap-3 items-center p-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-5 flex-1 rounded-md" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </CardContent>
      </Card>
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
    <Card
      className={cn(
        "w-56 md:w-60 lg:w-80 max-h-48",
        CARD_BASE,
        CARD_COLORS.events,
      )}
      onClick={() => onProfileClick?.(match)}
      onKeyDown={(e) => e.key === "Enter" && onProfileClick?.(match)}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="flex flex-row gap-3 items-center p-4">
        {event?.thumbnail ? (
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src={event.thumbnail}
              alt={event.name}
              fill
              sizes="40px"
              className="rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-rose-200 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-rose-600" aria-hidden="true" />
          </div>
        )}
        <span className="font-medium text-base lg:text-lg flex-1 !m-0 truncate text-secondary-foreground">
          {event?.name || "Event"}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
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
        <span className="text-sm text-muted-foreground line-clamp-2">
          <Markdown
            rawText={
              event?.description
                ? stripHtml(event.description)
                : "No description available."
            }
          />
        </span>
      </CardContent>
    </Card>
  );
}
