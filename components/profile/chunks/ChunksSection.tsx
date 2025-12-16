"use client";
import { useChunkContext } from "./hooks/ChunkProvider";
import { useEffect, useState } from "react";
import { ChunkActions } from "./ChunkActions";
import { ChunksDisplay } from "./display/ChunksDisplay";

export default function ChunksSection() {
  const { fetchChunks } = useChunkContext();
  const [fetched, setFetched] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (fetched) return;
    fetchChunks();
    setFetched(true);
  }, [fetchChunks, fetched]);

  return (
    <div className="w-full flex flex-col gap-6 mb-24">
      {/* Chunk Actions - Edit mode, Upload Resume */}
      <ChunkActions isEditing={isEditing} setIsEditing={setIsEditing} />

      {/* Chunks */}
      <ChunksDisplay isEditing={isEditing} />
    </div>
  );
}
