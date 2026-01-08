"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import { EntityResult } from "@/lib/search/types";
import { useEntityCache } from "../hooks/useEntityCache";

interface MatchResultsProps {
  match: EntityResult;
  userIndex: number;
}

export default function MatchResults({ match, userIndex }: MatchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
      <div
        className="flex items-center gap-3 mb-2 cursor-pointer rounded-lg p-2 -m-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <UserAvatar
          avatarUrl={profile?.avatar_url || ""}
          fullName={name || "User"}
        />
        <span className="font-medium text-lg flex-1">{name || "User"}</span>
      </div>
    </motion.div>
  );
}
