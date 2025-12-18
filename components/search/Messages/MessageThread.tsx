"use client";
import { motion } from "framer-motion";
import { CompletedResponse } from "./CompletedResponse";
import { UserProfile, ChatMessage } from "../types";
import { SearchProgressIndicator } from "./SearchProgressIndicator";

interface MessageThreadProps {
  message: ChatMessage;
  index: number;
  onUserClick?: (user: UserProfile) => void;
}

export function MessageThread({ message, index }: MessageThreadProps) {
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
          <div className="text-muted text-sm mb-1">you</div>
          <div className="text-lg">{message.query}</div>
        </div>
      </motion.div>

      {/* AI Response */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <div className="text-muted text-sm mb-2">c3</div>

        {/* Loading State */}
        {message.content ? (
          // Completed Results
          <CompletedResponse content={message.content} />
        ) : (
          <SearchProgressIndicator progress={message.progress} />
        )}
      </motion.div>
    </div>
  );
}
