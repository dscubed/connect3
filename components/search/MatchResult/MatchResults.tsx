"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import FileDescription from "./FileDescription";
import { ChevronDown } from "lucide-react";
import { EntityResult } from "@/lib/search/types";
import { useEntityCache } from "../hooks/useEntityCache";

interface MatchResultsProps {
  match: EntityResult;
  userIndex: number;
}

export default function MatchResults({ match, userIndex }: MatchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const avatarUrl = useEntityCache(match.id, match.type)?.avatar_url || "";

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
        <UserAvatar avatarUrl={avatarUrl} fullName={match.name || "User"} />
        <span className="font-medium text-lg flex-1">
          {match.name || "User"}
        </span>

        {/* Show collapsed message when not expanded */}
        {!isExpanded && (
          <span className="text-muted text-sm mr-2">
            Show {match.relevantFiles.length}{" "}
            {match.relevantFiles.length === 1 ? "match" : "matches"}
          </span>
        )}

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </div>

      {/* Collapsible file descriptions */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="space-y-2">
          {match.relevantFiles.map((file, fileIndex) => (
            <FileDescription
              key={file.file_id + fileIndex}
              file={file}
              delay={0.6 + userIndex * 0.2 + fileIndex * 0.1}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
