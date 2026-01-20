"use client";

import { useCallback, useRef } from "react";
import { ChatMessage, SearchProgress } from "../types";
import { useAuthStore } from "@/stores/authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

// 🔴 MODULE LOAD PROOF
console.log("[useSearchStream] MODULE LOADED");

// Type for setMessages prop
type MessageUpdater = React.Dispatch<React.SetStateAction<ChatMessage[]>>;

export function useSearchStream(setMessages: MessageUpdater) {
  // 🔴 HOOK INVOCATION PROOF
  console.log("[useSearchStream] hook invoked");

  const supabase = useAuthStore((s) => s.getSupabaseClient());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const updateMessage = useCallback(
    (messageId: string, update: Partial<ChatMessage>) => {
      console.log("[useSearchStream] updateMessage", { messageId, update });

      setMessages((prev) => {
        const target = prev.find((m) => m.id === messageId);
        console.log("[useSearchStream] target before update", target);
        const next = prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...update } : msg,
        );
        console.log("[useSearchStream] messages after update", next);
        return next;
      });
    },
    [setMessages],
  );

  const updateProgress = useCallback(
    (messageId: string, progressUpdate: SearchProgress) => {
      console.log("[useSearchStream] updateProgress", {
        messageId,
        progressUpdate,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, progress: progressUpdate } : msg,
        ),
      );
    },
    [setMessages],
  );

  const connectStream = useCallback(
    async (messageId: string) => {
      // 🔴 CONNECT STREAM ENTRY
      console.log("[useSearchStream] connectStream CALLED", {
        messageId,
        ts: Date.now(),
      });

      if (!supabase) {
        console.error("[useSearchStream] supabase client is NULL");
        return;
      }

      if (channelRef.current) {
        console.log("demonstrating removeChannel", channelRef.current.topic);
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `message:${messageId}`;
      console.log("[useSearchStream] creating channel", channelName);

      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      channel.on("broadcast", { event: "status" }, (payload) => {
        console.log("[useSearchStream] status event", payload);
        const raw = (payload as any)?.payload;
        const progressUpdate =
          typeof raw === "string" ? { message: raw } : (raw as SearchProgress);
        updateProgress(messageId, progressUpdate);
      });

      channel.on("broadcast", { event: "progress" }, (payload) => {
        console.log("[useSearchStream] progress event", payload);
        const raw = (payload as any)?.payload;
        const progressUpdate =
          typeof raw === "string" ? { message: raw } : (raw as SearchProgress);
        updateProgress(messageId, progressUpdate);
      });

      channel.on("broadcast", { event: "done" }, ({ payload }) => {
        const data = payload as any;

        // server emits { success: true, result: SearchResponse }
        const result: any = data?.result ?? data?.response;

        // The content is normalized by CompletedResponse component
        // which handles both new markdown format and legacy format
        const content =
          result && typeof result === "object"
            ? result
            : { markdown: "", entities: [] };

        updateMessage(messageId, {
          status: "completed",
          content,
          progress: { step: "completed", message: "Done" } as any,
        });
      });

      channel.on("broadcast", { event: "error" }, (payload) => {
        console.log("[useSearchStream] ERROR EVENT RECEIVED", payload);

        updateMessage(messageId, {
          status: "failed",
          content: (payload.payload as any)?.message ?? "Unknown error",
        });
      });

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("[useSearchStream] subscribe timeout, continuing");
          resolve();
        }, 8000);

        channel.subscribe((status, err) => {
          console.log("[useSearchStream] channel subscribe status", {
            channelName,
            status,
            err,
          });

          if (err) {
            clearTimeout(timeout);
            console.warn("[useSearchStream] subscribe error, continuing", err);
            resolve();
            return;
          }

          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve();
          }
        });
      });
    },
    [supabase, updateMessage, updateProgress],
  );

  const closeStream = useCallback(() => {
    console.log("[useSearchStream] closeStream called");

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  return { connectStream, closeStream };
}
