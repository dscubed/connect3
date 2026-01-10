import { useEffect, useMemo } from "react";
import { CategoryChunks, ProfileChunk } from "../ChunkUtils";
import { AllCategories, CategoryOrderData, ChunkInput } from "../ChunkUtils";
import { useAuthStore } from "@/stores/authStore";

export interface UseChunkExports {
  orderedCategoryChunks: CategoryChunks[];
  addChunk: (category: AllCategories, text: string) => void;
  updateChunk: (data: ChunkInput) => void;
  removeChunk: (id: string) => void;
}

export function useChunks({
  chunks,
  categoryOrder,
  setChunks,
  setCategoryOrder,
}: {
  chunks: ProfileChunk[];
  categoryOrder: CategoryOrderData[];
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  setCategoryOrder: React.Dispatch<React.SetStateAction<CategoryOrderData[]>>;
}): UseChunkExports {
  const { profile } = useAuthStore();

  // set categoryChunks map based on category and chunk orders
  const orderedCategoryChunks = useMemo(() => {
    /**
     * An array of categories with their associated chunks ordered,
     * - Categories are ordered based on the categoryOrder state.
     * - Chunks within each category are ordered based on their order property.
     *
     * @returns An array of category with respective ordered chunks.
     */
    return categoryOrder.map(({ category }) => ({
      category,
      chunks: chunks
        .filter((chunk) => chunk.category === category)
        .sort((a, b) => a.order - b.order)
        .map((chunk) => ({
          id: chunk.id,
          text: chunk.text,
          order: chunk.order,
        })),
    }));
  }, [categoryOrder, chunks]);

  // When chunks update if a category has no chunks remove it from categoryOrder
  useEffect(() => {
    const usedCategories = new Set(chunks.map((chunk) => chunk.category));
    setCategoryOrder((prev) =>
      prev.filter((cat) => usedCategories.has(cat.category))
    );
  }, [chunks, setCategoryOrder]);

  // Add a new chunk
  const addChunk = (category: AllCategories, text: string) => {
    /**
     * Adds a new chunk to the specified category with the provided text.
     * If the category does not exist in the categoryOrder, it is added.
     *
     * @param category - The category to which the new chunk will be added.
     * @param text - The text content of the new chunk.
     */
    if (!profile) return;

    // Check if category exists if not add it
    if (!categoryOrder.find((cat) => cat.category === category)) {
      setCategoryOrder((prev) => [
        ...prev,
        { profile_id: profile.id, category, order: prev.length },
      ]);
    }

    // Add new chunk and set its order within the category to the end
    setChunks((prev) => {
      const categoryChunks = prev.filter(
        (chunk) => chunk.category === category
      );
      const newChunk: ProfileChunk = {
        id: crypto.randomUUID(),
        text: text,
        category,
        order: categoryChunks.length,
      };
      return [...prev, newChunk];
    });
  };

  // Update Chunk
  const updateChunk = (data: ChunkInput) => {
    /**
     * Updates an existing chunk with new text and/or category.
     *
     * @param data - The chunk data containing id, text, and category.
     */
    setChunks((prev) =>
      prev.map((chunk) =>
        chunk.id === data.id
          ? {
              ...chunk,
              text: data.text,
              category: data.category!,
            }
          : chunk
      )
    );
  };

  const removeChunk = (id: string) => {
    /**
     * Removes a chunk by its ID.
     *
     * @param id - The ID of the chunk to be removed.
     */
    setChunks((prev) => prev.filter((chunk) => chunk.id !== id));
  };

  return { orderedCategoryChunks, addChunk, updateChunk, removeChunk };
}
