"use client";

import { useCallback, useRef } from "react";
import { ChatMessage, ProgressAction, ThinkingStep } from "../utils";
import { useAuthStore } from "@/stores/authStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { EntityResult } from "@/lib/search/types";

// Type for setMessages prop
type MessageUpdater = React.Dispatch<React.SetStateAction<ChatMessage[]>>;

export function useSearchStream(setMessages: MessageUpdater) {
  const supabase = useAuthStore((s) => s.getSupabaseClient());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  const updateMessage = useCallback(
    (messageId: string, update: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...update } : msg)),
      );
    },
    [setMessages],
  );

  const updateProgress = useCallback(
    (messageId: string, progressUpdate: ProgressAction[]) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, progress: progressUpdate } : msg,
        ),
      );
      console.log(
        `[progress] updated for message:, ${messageId}, ${progressUpdate}`,
      );
    },
    [setMessages],
  );

  const connectStream = useCallback(
    async (messageId: string): Promise<boolean> => {
      console.log("[stream] connect", messageId);

      if (!supabase) {
        console.error("[stream] no supabase client");
        return false;
      }

      // Remove old channel first
      if (channelRef.current) {
        console.log("[stream] removing old channel");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      currentMessageIdRef.current = messageId;
      const channelName = `message:${messageId}`;

      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      // Set up event handlers
      channel
        .on("broadcast", { event: "status" }, ({ payload }) => {
          console.log("[stream] status", payload);
        })
        .on("broadcast", { event: "thinking" }, ({ payload }) => {
          console.log("[stream] thinking", payload);
          const step = payload as ThinkingStep;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, thinking: [...(msg.thinking || []), step] }
                : msg,
            ),
          );
        })
        .on("broadcast", { event: "progress" }, ({ payload }) => {
          console.log("[stream] progress", payload);
          const p = payload as ProgressAction[];
          updateProgress(messageId, p);
        })
        .on("broadcast", { event: "response" }, ({ payload }) => {
          console.log("[stream] response", payload);
          const data = payload as {
            partial?: { markdown?: string; entities?: EntityResult[] };
          };
          if (data?.partial) {
            updateMessage(messageId, {
              status: "processing",
              content: {
                markdown: data.partial.markdown ?? "",
              },
            });
          }
        })
        .on("broadcast", { event: "done" }, ({ payload }) => {
          console.log("[stream] done", payload);
          const data = payload as { result?: ChatMessage["content"] };
          updateMessage(messageId, {
            status: "completed",
            content: data?.result ?? { markdown: "" },
          });
        })
        .on("broadcast", { event: "error" }, ({ payload }) => {
          console.log("[stream] error", payload);
          updateMessage(messageId, {
            status: "failed",
            content: null,
          });
        });

      // Subscribe and wait
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("[stream] subscribe timeout - continuing anyway");
          resolve(true); // Continue anyway, server might still work
        }, 10000);

        channel.subscribe((status) => {
          console.log("[stream] status:", status);
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            console.log("[stream] subscribed OK");
            resolve(true);
          }
          if (status === "CHANNEL_ERROR" || status === "CLOSED") {
            clearTimeout(timeout);
            console.warn("[stream] failed:", status);
            resolve(false);
          }
        });
      });
    },
    [supabase, updateMessage, updateProgress],
  );

  const closeStream = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    currentMessageIdRef.current = null;
  }, [supabase]);

  const isConnected = useCallback(() => {
    return channelRef.current !== null;
  }, []);

  const getCurrentMessageId = useCallback(() => {
    return currentMessageIdRef.current;
  }, []);

  return { connectStream, closeStream, isConnected, getCurrentMessageId };
}
