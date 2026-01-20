"use client";
import { motion } from "framer-motion";
import { CompletedResponse } from "./CompletedResponse";
import { UserProfile, ChatMessage } from "../types";
import { SearchProgressIndicator } from "./SearchProgressIndicator";
import UserAvatar from "../MatchResult/UserAvatar";
import { useAuthStore } from "@/stores/authStore";
import { Item } from "@/components/ui/item";
import { FilledLogo } from "@/components/logo/FilledLogo";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface MessageThreadProps {
  message: ChatMessage;
  index: number;
  onUserClick?: (user: UserProfile) => void;
  onRetry?: (messageId: string) => void;
}

export function MessageThread({ message, index, onRetry }: MessageThreadProps) {
  const { profile } = useAuthStore();

  const renderContent = () => {
    // Failed state
    if (message.status === "failed") {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-red-500 text-sm">
            Search failed. Please try again.
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(message.id)}
              className="w-fit"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      );
    }

    // Completed with content
    if (message.content) {
      return <CompletedResponse content={message.content} />;
    }

    // Loading/processing state
    return <SearchProgressIndicator progress={message.progress} />;
  };

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

        {renderContent()}
      </motion.div>
    </div>
  );
}
