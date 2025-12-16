"use client";
import { useChunkContext } from "./hooks/ChunkProvider";
import { useEffect, useRef, useState } from "react";
import { ChunkActions } from "./ChunkActions";
import { ChunksDisplay } from "./display/ChunksDisplay";
import { useAuthStore } from "@/stores/authStore";

export default function ChunksSection() {
  const { fetchChunks } = useChunkContext();
  const profile = useAuthStore((state) => state.profile);
  const fetchedRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (fetchedRef.current || !profile) return;
    fetchChunks();
    fetchedRef.current = true;
  }, [fetchChunks, profile]);

  return (
    <div className="w-full flex flex-col gap-6 mb-24">
      {/* Chunk Actions - Edit mode, Upload Resume */}
      <ChunkActions isEditing={isEditing} setIsEditing={setIsEditing} />

      {/* Chunks */}
      <ChunksDisplay isEditing={isEditing} />
    </div>
  );
}
