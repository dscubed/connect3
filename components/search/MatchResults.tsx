"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import FileDescription from "./FileDescription";
import { ChevronDown } from "lucide-react";

interface MatchResultsProps {
  match: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    files: { file_id: string; description: string }[];
  };
  userIndex: number;
}

export default function MatchResults({ match, userIndex }: MatchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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
        className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <UserAvatar
          avatarUrl={match?.avatar_url}
          fullName={match.full_name || "User"}
        />
        <span className="text-white font-medium text-lg flex-1">
          {match.full_name || "User"}
        </span>

        {/* Show collapsed message when not expanded */}
        {!isExpanded && (
          <span className="text-white/60 text-sm mr-2">
            Show {match.files.length}{" "}
            {match.files.length === 1 ? "match" : "matches"}
          </span>
        )}

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60"
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
          {match.files.map((file, fileIndex) => (
            <FileDescription
              key={file.file_id}
              file={file}
              delay={0.6 + userIndex * 0.2 + fileIndex * 0.1}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
