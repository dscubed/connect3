"use client";
import { useRef, useCallback } from "react";
import {
  createClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface UseRealtimeSubscriptionProps {
  onMessageUpdate: (message: ChatMessage) => void;
  onNewMessage: (message: ChatMessage) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function useRealtimeSubscription({
  onMessageUpdate,
  onNewMessage,
  onLoadingChange,
}: UseRealtimeSubscriptionProps) {
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  // Handle real-time message updates
  const handleMessageUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<ChatMessage>) => {
      console.log("📡 Real-time message update:", payload);

      const updatedMessage = payload.new;

      // Type guard: Check if updatedMessage has the required properties
      if (!updatedMessage || !("id" in updatedMessage)) return;

      onMessageUpdate(updatedMessage);

      // If this message is completed or failed, stop loading
      if (
        updatedMessage.status === "completed" ||
        updatedMessage.status === "failed"
      ) {
        onLoadingChange(false);
      }
    },
    [onMessageUpdate, onLoadingChange]
  );

  // Handle new messages being added to the chatroom
  const handleNewMessage = useCallback(
    (payload: RealtimePostgresChangesPayload<ChatMessage>) => {
      console.log("📡 New message added:", payload);

      const newMessage = payload.new;

      if (!newMessage || !("id" in newMessage)) return;

      onNewMessage(newMessage);
      onLoadingChange(true);
    },
    [onNewMessage, onLoadingChange]
  );

  // Subscribe to chatroom messages
  const subscribeToChatroom = useCallback(
    (chatroomId: string) => {
      console.log("📡 Subscribing to chatroom:", chatroomId);

      // Unsubscribe from previous subscription if exists
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      // Subscribe to all message changes in this chatroom
      subscriptionRef.current = supabase
        .channel(`chatroom-${chatroomId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "chatmessages",
            filter: `chatroom_id=eq.${chatroomId}`,
          },
          handleMessageUpdate
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chatmessages",
            filter: `chatroom_id=eq.${chatroomId}`,
          },
          handleNewMessage
        )
        .subscribe((status) => {
          console.log("📡 Subscription status:", status);
        });
    },
    [handleMessageUpdate, handleNewMessage]
  );

  // Cleanup subscription
  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      console.log("📡 Unsubscribing from real-time updates");
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  return {
    subscribeToChatroom,
    unsubscribe,
  };
}
