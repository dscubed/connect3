import { CategoryList } from "./CategoryList";
import type { ChunkData } from "@/components/profile/chunks/ChunkUtils";

interface ChunksListProps {
  chunks: ChunkData[];
  chunksLoading?: boolean;
}

export function ChunksList({ chunks, chunksLoading }: ChunksListProps) {
  if (chunksLoading) {
    return (
      <div className="text-white/40 text-sm text-center py-4">
        Loading chunks...
      </div>
    );
  }
  if (!chunks || chunks.length === 0) {
    return (
      <div className="text-white/40 text-sm text-center py-4">
        No chunks available.
      </div>
    );
  }

  // Group chunks by category
  const groupedChunks = chunks.reduce<Record<string, ChunkData[]>>(
    (acc, chunk) => {
      const category =
        chunk.category && chunk.category.trim() !== ""
          ? chunk.category
          : "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(chunk);
      return acc;
    },
    {}
  );

  return <CategoryList groupedChunks={groupedChunks} />;
}
