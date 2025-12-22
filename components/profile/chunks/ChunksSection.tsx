"use client";
import { useChunkContext } from "./hooks/ChunkProvider";
import { useEffect, useRef } from "react";
import { ChunkActions } from "./ChunkActions";
import { ChunksDisplay } from "./display/ChunksDisplay";
import { useAuthStore } from "@/stores/authStore";

export default function ChunksSection() {
  const { fetchChunks } = useChunkContext();
  const profile = useAuthStore((state) => state.profile);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || !profile) return;
    fetchChunks();
    fetchedRef.current = true;
  }, [fetchChunks, profile]);

  return (
    <div className="w-full flex flex-col gap-6 mb-24">
      <div className="w-full flex gap-2 items-center">
        <ChunkActions />
      </div>

      {/* Chunks */}
      <ChunksDisplay />
    </div>
  );
}
