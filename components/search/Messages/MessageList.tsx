"use client";
import MessageThread from "./MessageThread";
import { useTransformMessages } from "../hooks/useTransformMessages";
import { UserProfile } from "../types";

interface SearchResults {
  result: string;
  matches: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    files: { file_id: string; description: string }[];
  }[];
  followUps: string;
}

interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: SearchResults | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface MessageListProps {
  messages: ChatMessage[];
  onUserClick?: (user: UserProfile) => void;
  isLoading?: boolean;
}

export default function MessageList({
  messages,
  onUserClick,
}: MessageListProps) {
  const { transformedMessages, isTransforming } =
    useTransformMessages(messages);

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
      {transformedMessages.map((message, index) => (
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
