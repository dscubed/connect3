import React, { createContext, useContext, useState, ReactNode } from "react";
import { CategoryOrderData, ProfileChunk } from "../ChunkUtils";
import { UseChunkExports as ChunkHelpers, useChunks } from "./useChunks";
import {
  useMoveChunks,
  UseMoveChunksExports as ChunkMoveHelpers,
} from "./useMoveChunks";
import {
  useChunkData,
  UseChunkDataExports as ChunkDataHelpers,
} from "./useChunkData";
import {
  useEditChunks,
  UseEditChunksExports as ChunkEditHelpers,
} from "./useEditChunks";

type ChunkContextType = ChunkHelpers &
  ChunkDataHelpers &
  ChunkMoveHelpers &
  ChunkEditHelpers & {
    // Core editing state
    isEditing: boolean;
    setEditingChunks: (editing: boolean) => void;
  };

const ChunkContext = createContext<ChunkContextType | undefined>(undefined);

export function ChunkProvider({ children }: { children: ReactNode }) {
  // Core chunk states
  const [chunks, setChunks] = useState<ProfileChunk[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrderData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Chunk Actions
  const chunkHelpers = useChunks({
    chunks,
    categoryOrder,
    setChunks,
    setCategoryOrder,
  });

  // Move Actions
  const moveHelpers = useMoveChunks({
    setChunks,
    setCategoryOrder,
  });

  // Data Operations
  const dataHelpers = useChunkData({
    setChunks,
    setCategoryOrder,
    chunks,
    categoryOrder,
  });

  // Edit Operations
  const editHelpers = useEditChunks({
    chunks,
    setChunks,
    orderedCategoryChunks: chunkHelpers.orderedCategoryChunks,
    setCategoryOrder,
  });

  const setEditingChunks = (editing: boolean) => {
    /**
     * Sets the editing state and initialises edit state if entering edit mode.
     * @param editing - Boolean indicating whether to enter or exit edit mode.
     */
    setIsEditing(editing);
    if (editing) {
      editHelpers.initialiseEditState();
    }
  };

  return (
    <ChunkContext.Provider
      value={{
        isEditing,
        setEditingChunks,
        ...chunkHelpers,
        ...moveHelpers,
        ...dataHelpers,
        ...editHelpers,
      }}
    >
      {children}
    </ChunkContext.Provider>
  );
}

export function useChunkContext() {
  const ctx = useContext(ChunkContext);
  if (!ctx)
    throw new Error("useChunkContext must be used within a ChunkProvider");
  return ctx;
}
