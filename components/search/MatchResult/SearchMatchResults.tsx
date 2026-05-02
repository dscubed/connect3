"use client";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import { EntityResult, EntityType } from "@/lib/search/types";
import { cn } from "@/lib/utils";
import { useEntityCache } from "../hooks/useEntityCache";
import { useEventCache } from "../hooks/useEventCache";
import { useInstagramPostCache } from "../hooks/useInstagramPostCache";
import { Calendar, MapPin, Globe } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_COLORS: Record<EntityType, string> = {
  user: "bg-blue-50/50   border-blue-100",
  organisation: "bg-violet-50/50 border-violet-100",
  events: "bg-rose-50/50   border-rose-100",
  instagram_post: "bg-pink-50/50  border-pink-100",
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
      {match.type === "instagram_post" ? (
        <InstagramPostRow match={match} onProfileClick={onProfileClick} />
      ) : match.type === "events" ? (
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

  if (profile === null) return null;

  const name =
    profile.account_type === "organisation"
      ? (profile.first_name ?? "")
      : `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();

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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/* ── Instagram post row ───────────────────────────────────────────────────── */

function InstagramPostRow({
  match,
  onProfileClick,
}: {
  match: EntityResult;
  onProfileClick?: (e: EntityResult) => void;
}) {
  const { post, isLoading } = useInstagramPostCache(match.id);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border p-4",
          CARD_COLORS.instagram_post,
        )}
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      </div>
    );
  }

  const formattedDate = post?.timestamp
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(post.timestamp * 1000))
    : null;

  const firstImage = post?.images?.[0] ?? null;

  return (
    <button
      onClick={() => onProfileClick?.(match)}
      className={cn(
        "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:brightness-95",
        CARD_COLORS.instagram_post,
      )}
    >
      {/* Left: club name + date + caption */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <InstagramIcon className="w-3 h-3 text-pink-500 flex-shrink-0" />
          <p className="font-semibold text-sm text-secondary-foreground/80 truncate">
            {post?.club_name ?? post?.posted_by ?? "Instagram Post"}
          </p>
        </div>
        {formattedDate && (
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        )}
        {post?.caption && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {post.caption}
          </p>
        )}
      </div>
      {/* Right: post thumbnail */}
      {firstImage ? (
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={firstImage}
            alt="Instagram post"
            fill
            sizes="48px"
            className="rounded-lg object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
          <InstagramIcon className="w-5 h-5 text-pink-300" />
        </div>
      )}
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
