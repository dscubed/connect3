"use client";
import MessageThread from "./MessageThread";

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
  onUserClick?: (user: {
    id: string;
    name: string;
    status?: string;
    location?: string;
    tldr?: string;
    avatar?: string;
  }) => void;
  isLoading?: boolean;
}

export default function MessageList({
  messages,
  onUserClick,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

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
