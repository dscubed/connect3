"use client";
import { motion } from "framer-motion";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { useUserProfiles } from "../hooks/useUserProfiles";
import { CompletedResponse } from "./CompletedResponse";
import { UserProfile, ChatMessage } from "../types";

interface MessageThreadProps {
  message: ChatMessage;
  index: number;
  onUserClick?: (user: UserProfile) => void;
}

export default function MessageThread({
  message,
  index,
  onUserClick,
}: MessageThreadProps) {
  // Extract user IDs from message content for profile fetching
  const userIds = message.content?.matches?.map((match) => match.user_id) || [];

  // Fetch full user profiles for the matched users
  const { profiles, loading: profilesLoading } = useUserProfiles(userIds);

  return (
    <div className="space-y-8">
      {/* User Query */}
      <motion.div
        className="text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        <div className="inline-block">
          <div className="text-white/60 text-sm mb-1">you</div>
          <div className="text-white text-lg">{message.query}</div>
        </div>
      </motion.div>

      {/* AI Response */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <div className="text-white/60 text-sm mb-2">c3</div>

        {/* Loading State */}
        {message.status === "pending" || message.status === "processing" ? (
          <div className="space-y-4">
            <p className="text-white/80">
              {message.status === "processing"
                ? "processing your search..."
                : "queued for processing..."}
            </p>
            <div className="flex justify-center py-8">
              <CubeLoader size={48} />
            </div>
          </div>
        ) : message.status === "failed" ? (
          <div className="space-y-4">
            <div className="text-red-400">
              <p>Search failed. Please try again.</p>
            </div>
            <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Retry
            </button>
          </div>
        ) : message.content ? (
          // Completed Results
          <CompletedResponse
            content={message.content}
            userProfiles={profiles}
            profilesLoading={profilesLoading}
            onUserClick={onUserClick}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
