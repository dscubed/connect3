import { useEffect, useMemo } from "react";
import { CategoryChunks, ProfileChunk } from "../ChunkUtils";
import { AllCategories, CategoryOrderData, ChunkInput } from "../ChunkUtils";
import { useProfileContext } from "@/components/profile/ProfileProvider";

export interface UseChunkExports {
  orderedCategoryChunks: CategoryChunks[];
  addChunk: (category: AllCategories, text: string) => void;
  updateChunk: (data: ChunkInput) => void;
  removeChunk: (id: string) => void;
  getChunk: (id: string) => ProfileChunk | null;
  changeCategory: (oldCategory: AllCategories, newCategory: AllCategories) => void;
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
  const { profile } = useProfileContext();

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

  useEffect(() => {
    /**
     * This effect syncs categoryOrder with chunks:
     * - Removes categories that no longer have any chunks
     * - Adds new categories found in chunks
     */
    if (!profile) return;

    const staticCategories: AllCategories[] =
      profile?.account_type === "organisation" ? ["Events"] : [];
    const usedCategories = new Set([
      ...chunks.map((chunk) => chunk.category),
      ...staticCategories,
    ]);

    setCategoryOrder((prev) => {
      // Remove categories without chunks
      const filtered = prev.filter((cat) => usedCategories.has(cat.category));

      // Find categories in chunks that aren't in categoryOrder yet
      const existingCategories = new Set(filtered.map((cat) => cat.category));
      const newCategories = [...usedCategories].filter(
        (cat) => !existingCategories.has(cat)
      );

      // If nothing changed, return prev to avoid unnecessary re-render
      if (newCategories.length === 0 && filtered.length === prev.length) {
        return prev;
      }

      // Add new categories
      const additions = newCategories.map((category, idx) => ({
        profile_id: profile.id,
        category,
        order: filtered.length + idx,
      }));

      return [...filtered, ...additions];
    });
  }, [chunks, setCategoryOrder, profile]);

  const addChunk = (category: AllCategories, text: string) => {
    /**
     * Adds a new chunk to the specified category with the provided text.
     * Category will be auto-added by the effect if it doesn't exist.
     *
     * @param category - The category to which the new chunk will be added.
     * @param text - The text content of the new chunk.
     */
    if (!profile) return;

    // Just add the chunk - the effect will handle categoryOrder
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

  const updateChunk = (data: ChunkInput) => {
    /**
     * Updates an existing chunk with new text and/or category.
     *
     * @param data - The chunk data containing id, text, and category.
     */
    if (getChunk(data.id) === null) return;
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

  const getChunk = (id: string) => {
    /**
     * Retrieves a chunk by its ID.
     *
     * @param id - The ID of the chunk to retrieve.
     * @returns The chunk with the specified ID, or null if not found.
     */
    const chunk = chunks.find((chunk) => chunk.id === id) || null;
    return chunk;
  };

  const changeCategory = (oldCategory: AllCategories, newCategory: AllCategories) => {
    /**
     * Moves all chunks from oldCategory to newCategory.
     * The useEffect will sync categoryOrder when chunks change.
     */
    if (oldCategory === newCategory) return;
    if (!profile) return;

    setChunks((prev) =>
      prev.map((chunk) =>
        chunk.category === oldCategory
          ? { ...chunk, category: newCategory }
          : chunk
      )
    );
  };

  return {
    orderedCategoryChunks,
    addChunk,
    updateChunk,
    removeChunk,
    getChunk,
    changeCategory,
  };
}
