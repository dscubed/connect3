import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  AllCategories,
  CategoryChunks,
  CategoryOrderData,
  ChunkInput,
  ProfileChunk,
} from "../ChunkUtils";
import { useChunkActions } from "./useChunks";
import { useMoveChunks } from "./useMoveChunks";
import { useChunkData } from "./useChunkData";

type ChunkContextType = {
  // Display state
  orderedCategoryChunks: CategoryChunks[];

  // Loading states
  loadingChunks: boolean;
  savingChunks: boolean;
  // Editing states
  editChunks: Record<string, ChunkInput>;
  setEditChunks: React.Dispatch<
    React.SetStateAction<Record<string, ChunkInput>>
  >;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;

  // Actions
  addChunk: (category: AllCategories, text: string) => void;
  updateChunk: (id: string, data: ChunkInput) => void;
  removeChunk: (id: string) => void;
  moveCategory: (fromIndex: number, toIndex: number) => void;
  moveChunk: (
    category: AllCategories,
    fromIndex: number,
    toIndex: number
  ) => void;
  reset: () => void;

  // Data operations
  fetchChunks: () => Promise<void>;
  saveChunks: () => Promise<void>;
};

const ChunkContext = createContext<ChunkContextType | undefined>(undefined);

export function ChunkProvider({ children }: { children: ReactNode }) {
  const [chunks, setChunks] = useState<ProfileChunk[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrderData[]>([]);
  const [editChunks, setEditChunks] = useState<Record<string, ChunkInput>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Chunk Actions
  const { addChunk, updateChunk, removeChunk, orderedCategoryChunks } =
    useChunkActions({
      chunks,
      categoryOrder,
      setChunks,
      setCategoryOrder,
    });

  // Move Actions
  const { moveCategory, moveChunk } = useMoveChunks({
    setChunks,
    setCategoryOrder,
  });

  // Data Operations
  const { fetchChunks, saveChunks, reset, loadingChunks, savingChunks } =
    useChunkData({
      setChunks,
      setCategoryOrder,
      chunks,
      categoryOrder,
    });

  return (
    <ChunkContext.Provider
      value={{
        // States
        orderedCategoryChunks,
        loadingChunks,
        savingChunks,
        editChunks,
        setEditChunks,
        isEditing,
        setIsEditing,
        // Actions
        addChunk,
        updateChunk,
        removeChunk,
        reset,
        // Moving
        moveChunk,
        moveCategory,
        // Data operations
        fetchChunks,
        saveChunks,
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
