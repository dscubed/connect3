import { useEffect, useCallback } from "react";
import { useRealtimeChunks } from "./useRealtimeChunks";
import { useAuthStore } from "@/stores/authStore";
import { useProfileChunkStore } from "@/stores/profiles/profileChunkStore";
import { ChunkData } from "../ChunkUtils";

function groupChunks(chunks: ChunkData[]) {
  return chunks.reduce((acc, chunk) => {
    if (!acc[chunk.category]) acc[chunk.category] = [];
    acc[chunk.category].push(chunk);
    return acc;
  }, {} as Record<string, ChunkData[]>);
}

export function useChunksManager(userId: string) {
  const {
    chunks,
    setChunks,
    setGroupedChunks,
    setCategories,
    setExpandedCategories,
    setLoading,
  } = useProfileChunkStore();

  const { makeAuthenticatedRequest } = useAuthStore.getState();

  // Load chunks from API
  const loadChunks = useCallback(async () => {
    setLoading(true);
    const res = await makeAuthenticatedRequest(
      `/api/profiles/getChunks?userId=${userId}`
    );
    const data = await res.json();
    setChunks(data.chunks || []);
    setLoading(false);
  }, [userId, makeAuthenticatedRequest, setChunks, setLoading]);

  useEffect(() => {
    if (userId) loadChunks();
  }, [userId, loadChunks]);

  // Whenever chunks change, regroup and update categories/expanded
  useEffect(() => {
    const newGrouped = groupChunks(chunks);
    setGroupedChunks(newGrouped);
    const cats = Object.keys(newGrouped);
    setCategories(cats);
    setExpandedCategories(new Set(cats));
  }, [chunks, setGroupedChunks, setCategories, setExpandedCategories]);

  // Real-time handlers just update chunks
  const onChunkUpdate = useCallback(
    (updatedChunk: ChunkData) => {
      setChunks(
        chunks.map((chunk) =>
          chunk.id === updatedChunk.id ? updatedChunk : chunk
        )
      );
    },
    [setChunks, chunks]
  );

  const onNewChunk = useCallback(
    (newChunk: ChunkData) => {
      setChunks([newChunk, ...chunks]);
    },
    [setChunks, chunks]
  );

  const { subscribeToChunks, unsubscribe } = useRealtimeChunks({
    userId,
    onChunkUpdate,
    onNewChunk,
  });

  useEffect(() => {
    if (!userId) return;
    subscribeToChunks();
    return () => unsubscribe();
  }, [userId, subscribeToChunks, unsubscribe]);

  // Only return logic functions if needed
  return { loadChunks };
}
