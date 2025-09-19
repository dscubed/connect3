import { Chunk, CHUNKS_PER_PAGE, templateChunks } from "./ChunkUtils";

export default function getPagination({
  Chunks,
  currentPage,
}: {
  Chunks: Chunk[];
  currentPage: number;
}) {
  const displayChunks = Chunks.length > 0 ? Chunks : templateChunks;
  const totalItems = displayChunks.length + 1;
  const totalPages = Math.ceil(totalItems / CHUNKS_PER_PAGE);
  const currentChunks = displayChunks.slice(
    currentPage * CHUNKS_PER_PAGE,
    (currentPage + 1) * CHUNKS_PER_PAGE
  );

  return {
    displayChunks,
    totalItems,
    totalPages,
    currentChunks,
  };
}
