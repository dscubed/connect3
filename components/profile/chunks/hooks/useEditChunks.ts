import { useMemo, useState } from "react";
import {
  AllCategories,
  CategoryChunks,
  FocusDirection,
  ProfileChunk,
} from "../ChunkUtils";

export interface UseEditChunksExports {
  focusedChunkId: Record<AllCategories, string | null>;
  clearFocus: (category: AllCategories) => void;
  clearAllFocus: () => void;
  cancelEdits: (category: AllCategories) => void;
  saveEdits: (category: AllCategories) => void;
  cancelAllEdits: () => void;
  saveAllEdits: () => void;
  isEditingCategory: (category: AllCategories) => boolean;
  editCategory: (category: AllCategories) => void;
  addCategory: (category: AllCategories) => void;
  changeFocus: (category: AllCategories, direction: FocusDirection) => void;
  hasPendingEdits: () => boolean;
}

export function useEditChunks({
  chunks,
  setChunks,
  orderedCategoryChunks,
}: {
  chunks: ProfileChunk[];
  setChunks: React.Dispatch<React.SetStateAction<ProfileChunk[]>>;
  orderedCategoryChunks: CategoryChunks[];
}): UseEditChunksExports {
  // State to hold pre-edit chunks for cancelling edits per category
  const [preEditChunks, setPreEditChunks] = useState<
    Record<AllCategories, ProfileChunk[]>
  >({} as Record<AllCategories, ProfileChunk[]>);
  // State to hold focused chunk per category
  const [focusedChunkId, setFocusedChunkId] = useState<
    Record<AllCategories, string | null>
  >({} as Record<AllCategories, string | null>);

  const clearFocus = (category: AllCategories) => {
    /**
     * Clears the focused chunk for a specific category.
     *
     * @param category - The category for which to clear the focused chunk.
     */
    setFocusedChunkId((prev) => ({ ...prev, [category]: null }));
  };

  const clearAllFocus = () => {
    /**
     * Clears the focused chunk for all categories.
     */
    setFocusedChunkId({} as Record<AllCategories, string | null>);
  };

  const clearCategoryPreEdit = (category: AllCategories) => {
    /**
     * Clears the pre-edit chunks for a specific category.
     *
     * @param category - The category for which to clear the pre-edit chunks.
     */
    setPreEditChunks((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const revertCategoryEdits = (category: AllCategories) => {
    /**
     * Reverts the chunks of a specific category back to their pre-edit state.
     *
     * @param category - The category for which to revert the chunks.
     */
    setChunks((prev) => {
      const revertedChunks = prev.filter(
        (chunk) => chunk.category !== category
      );
      const preEditChunk = preEditChunks[category];
      if (preEditChunk) {
        revertedChunks.push(...preEditChunk);
      }
      return revertedChunks;
    });
  };

  const cancelEdits = (category: AllCategories) => {
    /**
     * Cancels the edits for a specific category.
     * - Reverts chunks to pre-edit state and exit edit mode.
     * - Clears the focus for the category
     *
     * @param category - The category for which to cancel the edits.
     */
    revertCategoryEdits(category);
    clearCategoryPreEdit(category);
    clearFocus(category);
  };

  const saveEdits = (category: AllCategories) => {
    /**
     * Saves the edits for a specific category.
     * - Simply exits edit mode by clearing pre-edit chunks.
     * - Clears the focus for the category
     *
     * @param category - The category for which to save the edits.
     */
    clearCategoryPreEdit(category);
    clearFocus(category);
  };

  const cancelAllEdits = () => {
    /**
     * Cancels edits for all categories.
     */

    Object.keys(preEditChunks).forEach((category) => {
      cancelEdits(category as AllCategories);
    });
  };

  const saveAllEdits = () => {
    /**
     *  Saves edits for all categories.
     */
    Object.keys(preEditChunks).forEach((category) => {
      saveEdits(category as AllCategories);
    });
  };

  const isEditingCategory = (category: AllCategories) => {
    /**
     * Checks if a specific category is currently in edit mode.
     * - Uses the presence of pre-edit chunks to determine edit mode.
     *
     * @param category - The category to check.
     * @returns True if the category is in edit mode, false otherwise.
     */
    return preEditChunks[category] !== undefined;
  };

  const orderedChunks = useMemo(() => {
    /**
     * Creates a map of categories to their respective ordered chunks.
     *  - uses orderedCategoryChunks to maintain category order and as a source
     *  of truth for chunk ordering.
     *
     * @return A record mapping each category to its list of ordered chunks.
     */

    const chunkMap: Record<AllCategories, ProfileChunk[]> = {} as Record<
      AllCategories,
      ProfileChunk[]
    >;
    orderedCategoryChunks.forEach(({ category, chunks }) => {
      chunkMap[category] = chunks.map((chunk) => ({
        ...chunk,
        category,
      }));
    });
    return chunkMap;
  }, [orderedCategoryChunks]);

  const editCategory = (category: AllCategories) => {
    /**
     * Enters edit mode for a specific category.
     * - Stores the current chunks of the category in pre-edit state.
     * - Sets focus to the first chunk in the category.
     *
     * @param category - The category to enter edit mode for.
     */

    if (isEditingCategory(category)) return; // return if already editing

    // Set pre-edit chunk for the category
    const categoryChunk = chunks.find((chunk) => chunk.category === category);
    setPreEditChunks((prev) => ({
      ...prev,
      [category]: categoryChunk ? { ...categoryChunk } : null,
    }));

    // Set focus to first chunk in category
    setFocusedChunkId((prev) => ({
      ...prev,
      [category]: orderedChunks[category]?.[0]?.id || null,
    }));
  };

  const addEmptyCategoryChunk = (category: AllCategories) => {
    /**
     *  Adds an empty chunk to a specific category.
     * - Used when adding a new category for editing.
     *
     * @param category - The category to which to add the empty chunk.
     */

    // Get new order in category for new chunk
    const categoryChunks = orderedChunks[category] || [];
    const newOrder =
      categoryChunks.length > 0
        ? categoryChunks[categoryChunks.length - 1].order + 1
        : 0;

    const newChunkId = crypto.randomUUID();
    setChunks((prev) => [
      ...prev,
      {
        id: newChunkId,
        text: "",
        category,
        order: newOrder,
      },
    ]);
    setFocusedChunkId((prev) => ({
      ...prev,
      [category]: newChunkId,
    }));
  };

  const addCategory = (category: AllCategories) => {
    /**
     * Adds a new category for editing by creating an empty chunk.
     * - Sets pre-edit chunks to null to indicate new category edit mode.
     *
     * @param category - The category to add.
     */
    if (chunks.find((chunk) => chunk.category === category)) return;

    // Set null pre-edit chunks and add an empty chunk
    setPreEditChunks((prev) => ({
      ...prev,
      [category]: null,
    }));
    addEmptyCategoryChunk(category);
  };

  const getFocusOrder = (
    direction: FocusDirection,
    category: AllCategories
  ) => {
    /**
     * Gets the ID of the next chunk to focus on based on the current focused chunk
     * and the specified direction.
     *
     * @param direction - The direction to move focus ("next" or "back").
     * @param category - The category of the chunks.
     * @returns The ID of the next chunk to focus on, or null if none found.
     */
    if (!focusedChunkId[category]) return null;
    const categoryChunks = orderedChunks[category];

    // Find current index of focused chunk
    const currentIndex = categoryChunks.findIndex(
      (chunk) => chunk.id === focusedChunkId[category]
    );
    if (currentIndex === -1) return null;

    // Get next or previous chunk based on direction
    if (direction === "next") {
      if (currentIndex + 1 < categoryChunks.length) {
        return categoryChunks[currentIndex + 1].id;
      }
    } else {
      if (currentIndex - 1 >= 0) {
        return categoryChunks[currentIndex - 1].id;
      }
    }
    // If no next or previous chunk, return current focused chunk id
    return focusedChunkId[category];
  };

  const changeFocus = (category: AllCategories, direction: FocusDirection) => {
    /**
     * Changes the focus to the next or previous chunk in a specific category.
     * - Updates the focused chunk ID based on the specified direction.
     *
     * @param category - The category of the chunks.
     * @param direction - The direction to move focus ("next" or "back").
     */
    const newFocusId = getFocusOrder(direction, category);
    setFocusedChunkId((prev) => ({
      ...prev,
      [category]: newFocusId,
    }));
  };

  const hasPendingEdits = () => {
    /**
     * Checks if there are any categories with pending edits.
     *
     * @returns True if any category has pending edits, false otherwise.
     */
    return Object.keys(preEditChunks).length > 0;
  };

  return {
    focusedChunkId,
    clearFocus,
    clearAllFocus,
    cancelEdits,
    saveEdits,
    cancelAllEdits,
    saveAllEdits,
    isEditingCategory,
    editCategory,
    addCategory,
    changeFocus,
    hasPendingEdits,
  };
}
