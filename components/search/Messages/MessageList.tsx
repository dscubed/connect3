"use client";
import { MessageThread } from "./MessageThread";
import { ChatMessage, UserProfile } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  onUserClick?: (user: UserProfile) => void;
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
}

export function MessageList({
  messages,
  onUserClick,
  onRetry,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-8">
      {messages.map((message, index) => (
        <MessageThread
          key={message.id}
          message={message}
          index={index}
          onUserClick={onUserClick}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
