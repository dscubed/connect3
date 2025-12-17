import { CategorySection } from "./CategorySection";
import type { ChunkData } from "@/components/profile/chunks/ChunkUtils";

interface CategoryListProps {
  orderedCategories: { category: string; chunks: ChunkData[] }[];
}

export function CategoryList({ orderedCategories }: CategoryListProps) {
  return (
    <div className="space-y-6">
      {orderedCategories.map(({ category, chunks }, idx) => (
        <CategorySection
          key={category}
          category={category}
          chunks={chunks}
          index={idx}
        />
      ))}
    </div>
  );
}
