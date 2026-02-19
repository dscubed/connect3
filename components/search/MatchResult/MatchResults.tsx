"use client";
import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import { EntityResult, EntityType } from "@/lib/search/types";
import { cn } from "@/lib/utils";
import { useEntityCache } from "../hooks/useEntityCache";
import { useEventCache } from "../hooks/useEventCache";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Globe } from "lucide-react";
import Image from "next/image";

const entityColorVariants: Record<EntityType, string> = {
  user: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  organisation: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  events: "bg-rose-50 border-rose-200 hover:bg-rose-100",
};

const INTERACTIVE_CARD_STYLES =
  "cursor-pointer hover:shadow-md transition-shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function AnimatedCardWrapper({
  children,
  index,
  keyPrefix,
}: {
  children: ReactNode;
  index: number;
  keyPrefix: string;
}) {
  return (
    <motion.div
      key={`${keyPrefix}-${index}`}
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
    >
      {children}
    </motion.div>
  );
}

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
  if (match.type === "events") {
    return (
      <EventMatchCardWrapper
        match={match}
        userIndex={userIndex}
        onProfileClick={onProfileClick}
      />
    );
  }

  return (
    <ProfileMatchCardWrapper
      match={match}
      userIndex={userIndex}
      onProfileClick={onProfileClick}
    />
  );
}

function ProfileMatchCardWrapper({
  match,
  userIndex,
  onProfileClick,
}: MatchResultsProps) {
  const profile = useEntityCache(match.id, match.type) || null;

  const name =
    profile?.account_type === "organisation"
      ? profile?.first_name
      : profile?.account_type === "user"
        ? `${profile?.first_name} ${profile?.last_name}`
        : null;

  return (
    <AnimatedCardWrapper index={userIndex} keyPrefix="user">
      <ProfileMatchCard
        name={name || "User"}
        avatarUrl={profile?.avatar_url || ""}
        userId={match.id}
        tldr={profile?.tldr}
        entity={match}
        onClick={onProfileClick}
      />
    </AnimatedCardWrapper>
  );
}

function EventMatchCardWrapper({
  match,
  userIndex,
  onProfileClick,
}: MatchResultsProps) {
  const { event } = useEventCache(match.id);

  return (
    <AnimatedCardWrapper index={userIndex} keyPrefix="event">
      <EventMatchCard
        name={event?.name || "Event"}
        thumbnail={event?.thumbnail}
        start={event?.start}
        isOnline={event?.isOnline}
        description={event?.description}
        entity={match}
        onClick={onProfileClick}
      />
    </AnimatedCardWrapper>
  );
}

const ProfileMatchCard = memo(function ProfileMatchCard({
  name,
  avatarUrl,
  userId,
  tldr,
  entity,
  onClick,
}: {
  name: string;
  tldr?: string;
  avatarUrl?: string;
  userId: string;
  entity: EntityResult;
  onClick?: (entity: EntityResult) => void;
}) {
  return (
    <Card
      className={cn(
        "w-56 md:w-60 lg:w-80 max-h-40",
        INTERACTIVE_CARD_STYLES,
        entityColorVariants[entity.type]
      )}
      onClick={() => onClick?.(entity)}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(entity)}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="flex flex-row gap-2 justify-center items-center p-4">
        <UserAvatar
          avatarUrl={avatarUrl || ""}
          fullName={name}
          userId={userId}
          isOrganisation={entity.type === "organisation"}
        />
        <span className="font-medium text-base lg:text-lg flex-1 !m-0 truncate text-secondary-foreground">
          {name || "User"}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {tldr || "No profile summary available."}
        </p>
      </CardContent>
    </Card>
  );
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const EventMatchCard = memo(function EventMatchCard({
  name,
  thumbnail,
  start,
  isOnline,
  description,
  entity,
  onClick,
}: {
  name: string;
  thumbnail?: string;
  start?: string;
  isOnline?: boolean;
  description?: string;
  entity: EntityResult;
  onClick?: (entity: EntityResult) => void;
}) {
  const formattedDate = start
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(start))
    : null;

  const plainDescription = description ? stripHtml(description) : null;

  return (
    <Card
      className={cn(
        "w-56 md:w-60 lg:w-80 max-h-48",
        INTERACTIVE_CARD_STYLES,
        entityColorVariants[entity.type]
      )}
      onClick={() => onClick?.(entity)}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(entity)}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="flex flex-row gap-3 items-center p-4">
        {thumbnail ? (
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src={thumbnail}
              alt={name}
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
          {name}
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
          {isOnline !== undefined && (
            <span className="flex items-center gap-1">
              {isOnline ? (
                <Globe className="w-3 h-3" aria-hidden="true" />
              ) : (
                <MapPin className="w-3 h-3" aria-hidden="true" />
              )}
              {isOnline ? "Online" : "In-Person"}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plainDescription || "No description available."}
        </p>
      </CardContent>
    </Card>
  );
});
