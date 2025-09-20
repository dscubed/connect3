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

interface ChunkData {
  id: string;
  user_id: string;
  category: string;
  summary_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  openai_file_id: string;
}

interface UseRealtimeChunksProps {
  userId: string;
  onChunkUpdate: (chunk: ChunkData) => void;
  onNewChunk: (chunk: ChunkData) => void;
}

export function useRealtimeChunks({
  userId,
  onChunkUpdate,
  onNewChunk,
}: UseRealtimeChunksProps) {
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  const handleChunkUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<ChunkData>) => {
      console.log("🔥 UPDATE payload received:", payload);
      const updatedChunk = payload.new;
      if (!updatedChunk || !("id" in updatedChunk)) return;
      onChunkUpdate(updatedChunk);
    },
    [onChunkUpdate]
  );

  const handleNewChunk = useCallback(
    (payload: RealtimePostgresChangesPayload<ChunkData>) => {
      console.log("🔥 INSERT payload received:", payload);
      const newChunk = payload.new;
      if (!newChunk || !("id" in newChunk)) return;
      onNewChunk(newChunk);
    },
    [onNewChunk]
  );

  const subscribeToChunks = useCallback(() => {
    console.log("📡 Subscribing to user_files for user:", userId);

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel(`user-chunks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_files",
          filter: `user_id=eq.${userId}`,
        },
        handleChunkUpdate
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_files",
          filter: `user_id=eq.${userId}`,
        },
        handleNewChunk
      )
      .subscribe((status) => {
        console.log("📡 Chunks subscription status:", status);
      });
  }, [userId, handleChunkUpdate, handleNewChunk]);

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      console.log("📡 Unsubscribing from user_files realtime");
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  return {
    subscribeToChunks,
    unsubscribe,
  };
}
