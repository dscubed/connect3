"use client";

import { useCallback, useRef } from "react";
import { ChatMessage, ProgressEntry } from "../utils";
import { useAuthStore } from "@/stores/authStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { EntityResult } from "@/lib/search/types";

// Type for setMessages prop
type MessageUpdater = React.Dispatch<React.SetStateAction<ChatMessage[]>>;

type ProgressMeta = {
  type?: "search" | "reasoning";
  itemId?: string;
  summaryIndex?: number;
  queries?: string[];
  callId?: string;
};

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
    (messageId: string, progressMessage: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, progress: progressMessage } : msg,
        ),
      );
      console.log(
        `[progress] updated for message: ${messageId}, ${progressMessage}`,
      );
    },
    [setMessages],
  );

  const appendReasoning = useCallback(
    (
      messageId: string,
      input: { delta?: string; text?: string; meta?: ProgressMeta },
    ) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          const prevList: ProgressEntry[] = Array.isArray(msg.progressEntries)
            ? msg.progressEntries
            : [];
          const nextList: ProgressEntry[] = [...prevList];

          const meta = input.meta;

          if (meta?.type === "search") {
            const queries = Array.isArray(meta.queries) ? meta.queries : [];
            if (queries.length === 0) return msg;
            const key = `search:${meta.callId ?? queries.join("|")}`;
            const existingIdx = nextList.findIndex((e) => e.key === key);
            if (existingIdx === -1) {
              nextList.push({ kind: "search", key, queries });
            }

            const boundedList =
              nextList.length > 14 ? nextList.slice(-14) : nextList;
            return { ...msg, progressEntries: boundedList };
          }

          const summaryIndex =
            typeof meta?.summaryIndex === "number"
              ? meta.summaryIndex
              : undefined;

          const chunk =
            typeof input.delta === "string" && input.delta.length > 0
              ? input.delta
              : typeof input.text === "string" && input.text.length > 0
                ? `\n${input.text}`
                : "";

          if (!chunk) return msg;

          const itemId = typeof meta?.itemId === "string" ? meta.itemId : "";
          const summaryKey =
            typeof summaryIndex === "number" && summaryIndex >= 0
              ? String(summaryIndex)
              : String(nextList.length);
          const key = `reasoning:${itemId || "no-item"}:${summaryKey}`;

          const existingIdx = nextList.findIndex((e) => e.key === key);
          const currentText =
            existingIdx >= 0 && nextList[existingIdx].kind === "reasoning"
              ? nextList[existingIdx].text
              : "";

          const combined = currentText + chunk;
          const boundedBlock =
            combined.length > 1200 ? combined.slice(-1200) : combined;

          const updatedEntry: ProgressEntry = {
            kind: "reasoning",
            key,
            text: boundedBlock,
          };

          if (existingIdx >= 0) {
            nextList[existingIdx] = updatedEntry;
          } else {
            nextList.push(updatedEntry);
          }

          // Bound number of blocks.
          const boundedList =
            nextList.length > 14 ? nextList.slice(-14) : nextList;
          return { ...msg, progressEntries: boundedList };
        }),
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
        .on("broadcast", { event: "progress" }, ({ payload }) => {
          console.log("[stream] progress", payload);
          const data = payload as { message: string };
          updateProgress(messageId, data.message ?? "Thinking");
        })
        .on("broadcast", { event: "reasoning" }, ({ payload }) => {
          const data = payload as
            | { delta?: string; text?: string; meta?: ProgressMeta }
            | undefined;

          if (!data) return;

          appendReasoning(messageId, {
            delta: typeof data.delta === "string" ? data.delta : undefined,
            text: typeof data.text === "string" ? data.text : undefined,
            meta: data.meta,
          });

          console.log("[stream] reasoning", payload);
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
    [supabase, updateMessage, updateProgress, appendReasoning],
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
