import { useState, useEffect, useCallback } from "react";
import { useRealtimeChunks } from "./useRealtimeChunks";
import { useAuthStore } from "@/stores/authStore";
import { ChunkData } from "../ChunkUtils";

function groupChunks(chunks: ChunkData[]) {
  return chunks.reduce((acc, chunk) => {
    if (!acc[chunk.category]) acc[chunk.category] = [];
    acc[chunk.category].push(chunk);
    return acc;
  }, {} as Record<string, ChunkData[]>);
}

export function useChunksManager(userId: string) {
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [groupedChunks, setGroupedChunks] = useState<
    Record<string, ChunkData[]>
  >({});
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState<boolean>(false);
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
  }, [userId, makeAuthenticatedRequest]);

  useEffect(() => {
    if (userId) loadChunks();
  }, [userId, loadChunks]);

  // Whenever chunks change, regroup and update categories/expanded
  useEffect(() => {
    const newGrouped = groupChunks(chunks);
    setGroupedChunks(newGrouped);
    const cats = Object.keys(newGrouped);
    setCategories(cats);
    setExpandedCategories(new Set(cats)); // expand all by default
  }, [chunks]);

  // Real-time handlers just update chunks
  const onChunkUpdate = useCallback((updatedChunk: ChunkData) => {
    setChunks((prev) =>
      prev.map((chunk) => (chunk.id === updatedChunk.id ? updatedChunk : chunk))
    );
  }, []);

  const onNewChunk = useCallback((newChunk: ChunkData) => {
    setChunks((prev) => [newChunk, ...prev]);
  }, []);

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

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return newExpanded;
    });
  };

  const expandAllCategories = () => {
    setExpandedCategories(new Set(categories));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  return {
    chunks,
    groupedChunks,
    categories,
    expandedCategories,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    loading,
    loadChunks,
  };
}
