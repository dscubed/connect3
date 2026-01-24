"use client";
import { MessageThread } from "./MessageThread";
import { ChatMessage } from "../utils";
import { EntityResult } from "@/lib/search/types";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onRetry: (messageId: string) => void;
  onEdit: (messageId: string, newQuery: string) => void;
  onProfileClick?: (entity: EntityResult) => void;
}

export function MessageList({
  messages,
  onRetry,
  onEdit,
  onProfileClick,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-8 pb-12">
      {messages.map((message, index) => (
        <MessageThread
          key={message.id}
          message={message}
          index={index}
          onRetry={onRetry}
          onEdit={onEdit}
          onProfileClick={onProfileClick}
        />
      ))}
    </div>
  );
}
