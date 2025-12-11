"use client";
import { useCallback, useRef } from "react";
import { ChatMessage, SearchProgress } from "../types";
import { useAuthStore } from "@/stores/authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

// Type for setMessages prop
type MessageUpdater = React.Dispatch<React.SetStateAction<ChatMessage[]>>;

const supabase = useAuthStore.getState().getSupabaseClient();

export function useSearchStream(setMessages: MessageUpdater) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const updateMessage = useCallback(
    (messageId: string, update: Partial<ChatMessage>) => {
      console.log("Updating message:", messageId, update);
      setMessages((prev) => {
        const updatedMessage = prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...update } : msg
        );
        console.log("Updated Messages:", updatedMessage);
        return updatedMessage;
      });
    },
    [setMessages]
  );

  const updateProgress = useCallback(
    (messageId: string, progressUpdate: SearchProgress) => {
      console.log("Updating progress for message:", messageId, progressUpdate);
      setMessages((prev) =>
        // Find matching message and update its progress
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          return {
            ...msg,
            progress: progressUpdate,
          };
        })
      );
    },
    [setMessages]
  );

  // Connect to stream with authenticated POST request
  const connectStream = useCallback(
    async (messageId: string) => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Create supabase channel
      const channel = supabase.channel(`message:${messageId}`);
      channelRef.current = channel;
      console.log("Channel:", channel.state);

      // console.log any received events for debugging TODO: remove later
      channel.on("broadcast", { event: "*" }, (payload) => {
        console.log("Received event:", payload);
      });

      channel.on("broadcast", { event: "progress" }, (payload) => {
        console.log("Progress payload:", payload);
        console.log("Payload data:", payload.payload);
        updateProgress(messageId, payload.payload as SearchProgress);
      });
      channel.on("broadcast", { event: "response" }, (payload) => {
        console.log("Response payload:", payload);
        updateMessage(messageId, { content: payload.payload.partial });
      });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Channel subscribed");
        }
      });
    },
    [updateProgress, updateMessage]
  );

  const closeStream = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { connectStream, closeStream };
}
