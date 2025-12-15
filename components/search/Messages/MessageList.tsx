"use client";
import { MessageThread } from "./MessageThread";
import { ChatMessage, UserProfile } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  onUserClick?: (user: UserProfile) => void;
  isLoading?: boolean;
}

export function MessageList({ messages, onUserClick }: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  if (isTransforming && transformedMessages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        <p className="text-white/60">Loading messages...</p>
      </div>
    );
  }

  console.log("All messages:", transformedMessages);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {messages.map((message, index) => (
        <MessageThread
          key={message.id}
          message={message}
          index={index}
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
}
