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
import type { ProfileDetailChunkCategory } from "@/components/profile/ProfileProvider";

type ChunkContextType = ChunkHelpers &
  ChunkDataHelpers &
  ChunkMoveHelpers &
  ChunkEditHelpers & {
    // Core editing state
    isEditing: boolean;
    exitEdit: () => void;
    resumeProcessing: boolean;
    setResumeProcessing: (processing: boolean) => void;
  };

const ChunkContext = createContext<ChunkContextType | undefined>(undefined);

export function ChunkProvider({
  children,
  isEditing,
  visitingProfileId,
  initialChunks,
}: {
  children: ReactNode;
  isEditing: boolean;
  visitingProfileId: string;
  initialChunks?: ProfileDetailChunkCategory[];
}) {
  // Core chunk states
  const [chunks, setChunks] = useState<ProfileChunk[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrderData[]>([]);
  const [resumeProcessing, setResumeProcessing] = useState(false);

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
    visitingProfileId,
    initialChunks,
  });

  // Edit Operations
  const editHelpers = useEditChunks({
    chunks,
    setChunks,
    orderedCategoryChunks: chunkHelpers.orderedCategoryChunks,
    setCategoryOrder,
  });

  const exitEdit = () => {
    editHelpers.cancelAllEdits();
    editHelpers.initialiseEditState();
  };

  return (
    <ChunkContext.Provider
      value={{
        ...chunkHelpers,
        ...moveHelpers,
        ...dataHelpers,
        ...editHelpers,
        isEditing,
        exitEdit,
        resumeProcessing,
        setResumeProcessing,
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
