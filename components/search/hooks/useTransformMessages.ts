import { useState, useEffect, useCallback, useRef } from "react";
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

export function useTransformMessages(messages: ChatMessage[]) {
  const [transformedMessages, setTransformedMessages] = useState<ChatMessage[]>(
    []
  );
  const [isTransforming, setIsTransforming] = useState(false);
  const isTransformingRef = useRef(false);

  const transformMessages = useCallback(async () => {
    if (messages.length === 0) {
      setTransformedMessages([]);
      return;
    }

    // Check if any messages need transformation
    const needsTransform = messages.some((message) => {
      if (!message.content?.matches) return false;
      const firstMatch = message.content.matches[0];
      return firstMatch && !("full_name" in firstMatch);
    });

    if (!needsTransform) {
      setTransformedMessages(messages);
      return;
    }

    if (isTransformingRef.current) return; // Use ref instead of state

    isTransformingRef.current = true;
    setIsTransforming(true);

    try {
      const supabase = useAuthStore.getState().getSupabaseClient();

      // Collect all unique user IDs
      const allUserIds = new Set<string>();
      messages.forEach((message) => {
        message.content?.matches?.forEach((match) => {
          allUserIds.add(match.user_id);
        });
      });

      if (allUserIds.size === 0) {
        setTransformedMessages(messages);
        return;
      }

      // Single database call for all user profiles
      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, id")
        .in("id", Array.from(allUserIds));

      const userMap = new Map<
        string,
        { full_name: string; avatar_url?: string }
      >();
      userProfiles?.forEach((profile) => {
        const full_name = `${profile.first_name} ${
          profile.last_name || ""
        }`.trim();
        userMap.set(profile.id, {
          full_name,
          avatar_url: profile.avatar_url || undefined,
        });
      });

      // Transform all messages
      const transformed = messages.map((message) => {
        if (!message.content?.matches) return message;

        // Check if already transformed
        const firstMatch = message.content.matches[0];
        if (firstMatch && "full_name" in firstMatch) {
          return message;
        }

        const transformedContent: SearchResults = {
          result: message.content.result,
          matches: message.content.matches.map((match) => {
            const user = userMap.get(match.user_id);
            return {
              user_id: match.user_id,
              full_name: user?.full_name || "Unknown User",
              avatar_url: user?.avatar_url,
              files: match.files,
            };
          }),
          followUps: message.content.followUps,
        };

        return {
          ...message,
          content: transformedContent,
        };
      });

      setTransformedMessages(transformed);
    } catch (error) {
      console.error("❌ Error transforming messages:", error);
      setTransformedMessages(messages);
    } finally {
      isTransformingRef.current = false;
      setIsTransforming(false);
    }
  }, [messages]);

  useEffect(() => {
    transformMessages();
  }, [transformMessages]);

  return {
    transformedMessages,
    isTransforming,
    refetch: transformMessages,
  };
}
