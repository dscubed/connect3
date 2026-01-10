import { AllCategories, CategoryOrderData } from "../ChunkUtils";
import { ProfileChunk } from "../ChunkUtils";

export function useMoveChunks({
  setChunks,
  setCategoryOrder,
}: {
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  setCategoryOrder: React.Dispatch<React.SetStateAction<CategoryOrderData[]>>;
}) {
  // Move Logic
  const moveCategory = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setCategoryOrder((prev) => {
      const updated = Array.from(prev);
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((cat, index) => ({
        ...cat,
        order: index,
      }));
    });
  };

  const moveChunk = (
    category: AllCategories,
    fromIndex: number,
    toIndex: number
  ) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    setChunks((prev) => {
      const categoryChunks = prev.filter(
        (chunk) => chunk.category === category
      );
      // Check indices are within bounds
      if (
        fromIndex >= categoryChunks.length ||
        toIndex >= categoryChunks.length
      )
        return prev;

      const updated = Array.from(categoryChunks);
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      // Update orders
      const reordered = updated.map((chunk, index) => ({
        ...chunk,
        order: index,
      }));
      // Merge back with other chunks
      const otherChunks = prev.filter((chunk) => chunk.category !== category);
      return [...otherChunks, ...reordered];
    });
  };

  return { moveCategory, moveChunk };
}
