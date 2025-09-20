"use client";
import { useEffect, useState } from "react";
import ChunkPagination from "./ChunkPagination";
import { Chunk } from "./utils/ChunkUtils";
import getPagination from "./utils/PaginationHandler";
import { ChunksGrid } from "./cards/ChunksGrid";

interface ChunkDisplayProps {
  chunks: Chunk[];
  setChunks?: (chunks: Chunk[]) => void;
}

export function ChunkDisplay({ chunks, setChunks }: ChunkDisplayProps) {
  const [userChunks, setUserChunks] = useState<Chunk[]>(chunks);
  const [currentPage, setCurrentPage] = useState(0);

  // Sync with parent chunks if they change
  useEffect(() => {
    setUserChunks(chunks);
  }, [chunks]);

  const { displayChunks, totalPages, currentChunks } = getPagination({
    Chunks: userChunks,
    currentPage,
  });

  return (
    <>
      {/* Chunks Grid */}
      <ChunksGrid
        chunks={userChunks}
        setChunks={setChunks}
        displayChunks={displayChunks}
        currentChunks={currentChunks}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {totalPages > 1 && (
        <ChunkPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
}
