"use client";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import { EntityResult } from "@/lib/search/types";
import { useEntityCache } from "../hooks/useEntityCache";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MatchResultsProps {
  match: EntityResult;
  userIndex: number;
  onProfileClick?: (entity: EntityResult) => void;
}

export default function MatchResults({ match, userIndex, onProfileClick }: MatchResultsProps) {
  const profile = useEntityCache(match.id, match.type) || null;

  let name = null;
  if (profile?.account_type === "organisation") name = profile?.first_name;
  else if (profile?.account_type === "user")
    name = `${profile?.first_name} ${profile?.last_name}`;

  return (
    <motion.div
      key={`user-${userIndex}`}
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.4 + userIndex * 0.2,
      }}
    >
      {/* User header with avatar and name - clickable to toggle */}
      <ProfileMatchCard
        name={name || "User"}
        avatarUrl={profile?.avatar_url || ""}
        tldr={profile?.tldr}
        entity={match}
        onClick={onProfileClick}
      />
    </motion.div>
  );
}

function ProfileMatchCard({
  name,
  avatarUrl,
  tldr,
  entity,
  onClick,
}: {
  name: string;
  tldr?: string;
  avatarUrl?: string;
  entity: EntityResult;
  onClick?: (entity: EntityResult) => void;
}) {
  return (
    <Card
      className="w-56 md:w-60 lg:w-80 max-h-40 cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onClick?.(entity)}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(entity)}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="flex flex-row gap-2 justify-center items-center p-4">
        <UserAvatar avatarUrl={avatarUrl || ""} fullName={name}></UserAvatar>
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
}
