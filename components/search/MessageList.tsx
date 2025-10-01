"use client";
import MessageThread from "./MessageThread";
import { useAuthStore } from "@/stores/authStore";

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

interface MessageContent {
  result: string;
  matches: {
    user_id: string;
    files: { file_id: string; description: string }[];
  }[];
  followUps: string;
}

const supabase = useAuthStore.getState().getSupabaseClient();

async function transformMessageContentToSearchResults(
  content: MessageContent
): Promise<SearchResults> {
  const { result, matches, followUps } = content;
  const userIdsSet = new Set<string>();
  matches.forEach((match) => userIdsSet.add(match.user_id));

  const userProfiles = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url, id")
    .in("id", Array.from(userIdsSet));

  const userMap = new Map<string, { full_name: string; avatar_url?: string }>();
  userProfiles.data?.forEach((profile) => {
    const full_name = `${profile.first_name} ${profile.last_name || ""}`.trim();
    userMap.set(profile.id, {
      full_name,
      avatar_url: profile.avatar_url || undefined,
    });
  });

  return {
    result,
    matches: matches.map((match) => {
      const user = userMap.get(match.user_id);
      return {
        user_id: match.user_id,
        full_name: user?.full_name || "Unknown User",
        avatar_url: user?.avatar_url,
        files: match.files,
      };
    }),
    followUps,
  };
}

export default function MessageList({
  messages,
  onUserClick,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  messages.map(async (message) => {
    if (message.content) {
      message.content = await transformMessageContentToSearchResults(
        message.content
      );
      console.log("Transformed message content:", message.content);
    }
    return null;
  });

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
