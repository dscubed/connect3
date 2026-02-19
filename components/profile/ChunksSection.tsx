"use client";
import { useChunkContext } from "./chunks/hooks/ChunkProvider";
import { useEffect, useRef } from "react";
import { ChunkActions } from "./chunks/ChunkActions";
import { ChunksDisplay } from "./chunks/display/ChunksDisplay";
import { useAuthStore } from "@/stores/authStore";

interface ChunksSectionProps {
  editingProfile: boolean;
}

export default function ChunksSection({ editingProfile }: ChunksSectionProps) {
  const { fetchChunks, loadingChunks } = useChunkContext();
  const profile = useAuthStore((state) => state.profile);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || !profile) return;
    fetchChunks();
    fetchedRef.current = true;
  }, [fetchChunks, profile]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Only show ChunkActions when content is ready - avoid skeleton + component overlap */}
      {editingProfile && !loadingChunks && <ChunkActions />}

      {/* Chunks - shows ChunksSkeleton or content, never both */}
      <ChunksDisplay />
    </div>
  );
}
