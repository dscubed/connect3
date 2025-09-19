"use client";
import { useEffect, useState } from "react";
import { Chunk } from "./ChunksSection";
import { motion } from "framer-motion";
import ChunkCard from "./ChunkCard";
import AddChunkCard from "./AddChunkCard";
import AddChunkButtonCard from "./AddChunkButtonCard";
import ChunkPagination from "./ChunkPagination";

interface ChunkCardsProps {
  chunks: Chunk[];
  setChunks?: (chunks: Chunk[]) => void;
}

export function ChunkCards({ chunks, setChunks }: ChunkCardsProps) {
  const [userChunks, setUserChunks] = useState<Chunk[]>(chunks);

  const [editingChunk, setEditingChunk] = useState<string | null>(null);
  const [editChunkDetails, setEditChunkDetails] = useState<Chunk | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newChunkDetails, setNewChunkDetails] = useState<Chunk>({
    chunk_id: "",
    category: "",
    content: "",
  });
  const [currentPage, setCurrentPage] = useState(0);

  const CHUNKS_PER_PAGE = 6;
  const WORD_LIMIT = 50;
  const MAX_CHUNKS = 30;

  // Sync with parent chunks if they change
  useEffect(() => {
    setUserChunks(chunks);
  }, [chunks]);

  const templateChunks: Chunk[] = [
    {
      chunk_id: "1",
      category: "Experience",
      content:
        "John Doe worked as a Project Manager at GlobalCorp from 2019 to 2023, leading diverse teams and delivering successful outcomes.",
    },
    {
      chunk_id: "2",
      category: "Education",
      content:
        "John Doe graduated from University of California in 2018 with a degree in Business Administration.",
    },
    {
      chunk_id: "3",
      category: "Community & Volunteering",
      content:
        "John Doe volunteered at City Food Bank from 2020 to 2022, organizing donation drives and supporting local families.",
    },
    {
      chunk_id: "4",
      category: "Skills & Interests",
      content:
        "John Doe is skilled in data analysis, public speaking, and enjoys hiking, photography, and learning new languages.",
    },
    {
      chunk_id: "5",
      category: "Achievements",
      content:
        "John Doe received the 'Community Impact Award' in 2021 for outstanding contributions to local initiatives.",
    },
  ];

  const displayChunks = userChunks.length > 0 ? userChunks : templateChunks;
  const totalItems = displayChunks.length + 1;
  const totalPages = Math.ceil(totalItems / CHUNKS_PER_PAGE);
  const currentChunks = displayChunks.slice(
    currentPage * CHUNKS_PER_PAGE,
    (currentPage + 1) * CHUNKS_PER_PAGE
  );

  const addCardIndex = displayChunks.length;
  const addCardPage = Math.floor(addCardIndex / CHUNKS_PER_PAGE);
  const showAddCard =
    currentPage === addCardPage && displayChunks.length < MAX_CHUNKS;

  const getWordCount = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

  // Unified update function for controlled/uncontrolled usage
  const updateChunks = (newChunks: Chunk[]) => {
    setUserChunks(newChunks);
    if (setChunks) setChunks(newChunks);
  };
  const handleChunkClick = (chunk: Chunk) => {
    setEditingChunk(chunk.chunk_id);
    setEditChunkDetails({ ...chunk });
  };

  const handleSaveEdit = () => {
    if (
      editingChunk &&
      editChunkDetails &&
      editChunkDetails.category.trim() &&
      editChunkDetails.content.trim()
    ) {
      const categoryTrimmed = editChunkDetails.category.trim();
      const contentTrimmed = editChunkDetails.content.trim();

      if (userChunks.length === 0) {
        updateChunks([
          {
            chunk_id: editingChunk,
            category: categoryTrimmed,
            content: contentTrimmed,
          },
        ]);
      } else {
        updateChunks(
          userChunks.map((chunk) =>
            chunk.chunk_id === editingChunk
              ? {
                  ...chunk,
                  category: categoryTrimmed,
                  content: contentTrimmed,
                }
              : chunk
          )
        );
      }
    }
    setEditingChunk(null);
    setEditChunkDetails(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setIsAddingNew(false);
    setNewChunkDetails({ chunk_id: "", category: "", content: "" });
  };

  const handleDeleteChunk = (chunkId: string) => {
    // Only allow deletes on real chunks, not templates
    if (userChunks.length === 0) {
      // If templates are showing, deleting just does nothing
      return;
    } else {
      updateChunks(userChunks.filter((chunk) => chunk.chunk_id !== chunkId));
    }
    const newTotalChunks = userChunks.length - 1;
    const newTotalPages = Math.ceil(newTotalChunks / CHUNKS_PER_PAGE);
    if (currentPage >= newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages - 1);
    }
  };

  const handleAddNewChunk = () => {
    if (newChunkDetails.category.trim() && newChunkDetails.content.trim()) {
      const newChunk: Chunk = {
        chunk_id: Date.now().toString(),
        category: newChunkDetails.category.trim(),
        content: newChunkDetails.content.trim(),
      };
      if (userChunks.length === 0) {
        updateChunks([newChunk]);
      } else {
        updateChunks([...userChunks, newChunk]);
      }
      setNewChunkDetails({ chunk_id: "", category: "", content: "" });
      setIsAddingNew(false);
      const newTotalChunks =
        userChunks.length === 0 ? 1 : userChunks.length + 1;
      const newChunkPage = Math.floor((newTotalChunks - 1) / CHUNKS_PER_PAGE);
      setCurrentPage(newChunkPage);
    }
  };

  return (
    <>
      {/* Chunks Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // increased gap for more space
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {currentChunks.map((chunk, idx) => (
          <ChunkCard
            key={chunk.chunk_id}
            chunk={chunk}
            idx={idx}
            editingChunk={editingChunk}
            editChunkDetails={editChunkDetails}
            setEditChunkDetails={setEditChunkDetails}
            handleChunkClick={handleChunkClick}
            handleDeleteChunk={handleDeleteChunk}
            handleSaveEdit={handleSaveEdit}
            setEditingChunk={setEditingChunk}
            getWordCount={getWordCount}
            WORD_LIMIT={WORD_LIMIT}
          />
        ))}

        {!isAddingNew && showAddCard && (
          <AddChunkButtonCard
            currentChunks={currentChunks}
            setIsAddingNew={setIsAddingNew}
          />
        )}

        {isAddingNew && (
          <AddChunkCard
            newChunkDetails={newChunkDetails}
            setNewChunkDetails={setNewChunkDetails}
            handleAddNewChunk={handleAddNewChunk}
            handleCancelAdd={() => {
              setIsAddingNew(false);
              setNewChunkDetails({ chunk_id: "", category: "", content: "" });
            }}
            getWordCount={getWordCount}
            WORD_LIMIT={WORD_LIMIT}
          />
        )}
      </motion.div>

      {totalPages > 1 && (
        <ChunkPagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </>
  );
}
