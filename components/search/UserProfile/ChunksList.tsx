import { CategoryList } from "./CategoryList";
import type {
  CategoryOrderData,
  ChunkData,
} from "@/components/profile/chunks/ChunkUtils";

interface ChunksListProps {
  chunks: ChunkData[];
  chunksLoading?: boolean;
  categoryOrder: CategoryOrderData[];
}

export function ChunksList({
  chunks,
  chunksLoading,
  categoryOrder,
}: ChunksListProps) {
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

  // Group chunks by category (no fallback needed)
  const grouped: Record<string, ChunkData[]> = {};
  for (const chunk of chunks) {
    const category = chunk.category;
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(chunk);
  }

  // Build ordered array of categories with their chunks
  const orderedCategories = [
    ...categoryOrder.map(({ category }) => ({
      category,
      chunks: grouped[category] || [],
    })),
    // Add any categories not in categoryOrder (fallback, just in case)
    ...Object.entries(grouped)
      .filter(([cat]) => !categoryOrder.some((c) => c.category === cat))
      .map(([category, chunks]) => ({ category, chunks })),
  ].filter(({ chunks }) => chunks.length > 0);

  return <CategoryList orderedCategories={orderedCategories} />;
}
