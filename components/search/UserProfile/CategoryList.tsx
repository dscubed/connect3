import { CategorySection } from "./CategorySection";
import type { ChunkData } from "@/components/profile/chunks/ChunkUtils";

interface CategoryListProps {
  groupedChunks: Record<string, ChunkData[]>;
}

export function CategoryList({ groupedChunks }: CategoryListProps) {
  return (
    <div className="space-y-6">
      {Object.entries(groupedChunks).map(([category, categoryChunks], idx) => (
        <CategorySection
          key={category}
          category={category}
          chunks={categoryChunks}
          index={idx}
        />
      ))}
    </div>
  );
}
