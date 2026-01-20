"use client";
import { motion } from "framer-motion";
import { CompletedResponse } from "./CompletedResponse";
import { UserProfile, ChatMessage } from "../types";
import { SearchProgressIndicator } from "./SearchProgressIndicator";
import UserAvatar from "../MatchResult/UserAvatar";
import { useAuthStore } from "@/stores/authStore";
import { Item } from "@/components/ui/item";
import { FilledLogo } from "@/components/logo/FilledLogo";

interface MessageThreadProps {
  message: ChatMessage;
  index: number;
  onUserClick?: (user: UserProfile) => void;
}

export function MessageThread({ message, index }: MessageThreadProps) {
  const { profile } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* User Query */}
      <motion.div
        className="flex justify-end gap-4 w-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        <Item
          className="text-base bg-background rounded-xl border-muted p-3 max-w-[50%]"
          variant={"outline"}
        >
          {message.query}
        </Item>
        <UserAvatar
          avatarUrl={profile?.avatar_url || ""}
          fullName={profile?.first_name || ""}
        />
      </motion.div>

      {/* AI Response */}
      <motion.div
        className="flex flex-row gap-4 space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <FilledLogo width={32} height={32} className="flex-shrink-0" />

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
