import { motion, AnimatePresence } from "framer-motion";
import ChunkCard from "./ChunkCard";
import AddChunkCard from "./AddChunkCard";
import AddChunkButtonCard from "./AddChunkButtonCard";
import { Chunk, CHUNKS_PER_PAGE, MAX_CHUNKS } from "../utils/ChunkUtils";
import { useState, useEffect } from "react";
import { validateChunk } from "@/lib/onboarding/validation/validateChunk";
import { toast } from "sonner";

interface ChunksGridProps {
  chunks: Chunk[];
  setChunks?: (chunks: Chunk[]) => void;
  displayChunks?: Chunk[]; // optional, for controlled pagination
  currentChunks?: Chunk[]; // optional, for controlled pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function ChunksGrid({
  chunks,
  setChunks,
  displayChunks,
  currentChunks,
  currentPage,
  setCurrentPage,
}: ChunksGridProps) {
  const [userChunks, setUserChunks] = useState<Chunk[]>(chunks);
  const [editingChunk, setEditingChunk] = useState<string | null>(null);
  const [editChunkDetails, setEditChunkDetails] = useState<Chunk | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newChunkDetails, setNewChunkDetails] = useState<Chunk | null>({
    chunk_id: "",
    category: "",
    content: "",
  });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setUserChunks(chunks);
  }, [chunks]);

  useEffect(() => {
    handleCancel();
  }, [currentPage]);

  const showAddCard =
    displayChunks &&
    currentPage === Math.floor(displayChunks.length / CHUNKS_PER_PAGE) &&
    displayChunks.length < MAX_CHUNKS;

  // Unified update function for controlled/uncontrolled usage
  const updateChunks = (newChunks: Chunk[]) => {
    setUserChunks(newChunks);
    if (setChunks) setChunks(newChunks);
  };

  const handleChunkClick = (chunk: Chunk) => {
    handleCancel();
    setEditingChunk(chunk.chunk_id);
    setEditChunkDetails({ ...chunk });
  };

  const handleSaveEdit = async () => {
    if (!editingChunk || !editChunkDetails) return;
    // Validate chunk before saving
    setIsValidating(true);
    const isValid = await validateChunk(editChunkDetails);
    if (!isValid) {
      toast.error(`Failed to validate chunk content.`);
      setIsValidating(false);
      return;
    }
    // Save changes
    const category = editChunkDetails.category.trim();
    const content = editChunkDetails.content.trim();

    if (userChunks.length === 0) {
      updateChunks([
        {
          chunk_id: editingChunk,
          category: category,
          content: content,
        },
      ]);
    } else {
      updateChunks(
        userChunks.map((chunk) =>
          chunk.chunk_id === editingChunk
            ? { ...chunk, category: category, content: content }
            : chunk
        )
      );
    }
    setIsValidating(false);
    setEditingChunk(null);
    setEditChunkDetails(null);
  };

  const handleCancel = () => {
    setEditingChunk(null);
    setEditChunkDetails(null);
    setIsAddingNew(false);
    setNewChunkDetails({ chunk_id: "", category: "", content: "" });
  };

  const handleDeleteChunk = (chunkId: string) => {
    if (userChunks.length === 0) return;
    updateChunks(userChunks.filter((chunk) => chunk.chunk_id !== chunkId));
    const newTotalChunks = userChunks.length - 1;
    const newTotalPages = Math.ceil(newTotalChunks / CHUNKS_PER_PAGE);
    if (currentPage >= newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages - 1);
    }
  };

  const handleAddNewChunk = async () => {
    if (!newChunkDetails) return;
    if (newChunkDetails.category.trim() && newChunkDetails.content.trim()) {
      setIsValidating(true);
      const isValid = await validateChunk(newChunkDetails);
      if (!isValid) {
        toast.error(`Failed to validate chunk content.`);
        setIsValidating(false);
        return;
      }
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
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {(currentChunks ?? []).map((chunk, idx) => (
          <AnimatePresence key={chunk.chunk_id}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1.05 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              className="group relative"
            >
              <ChunkCard
                chunk={chunk}
                editingChunk={editingChunk}
                editChunkDetails={editChunkDetails}
                setEditChunkDetails={setEditChunkDetails}
                handleChunkClick={handleChunkClick}
                handleDeleteChunk={handleDeleteChunk}
                handleSaveEdit={handleSaveEdit}
                validating={isValidating}
                handleCancel={handleCancel}
              />
            </motion.div>
          </AnimatePresence>
        ))}

        {!isAddingNew && showAddCard && (
          <AddChunkButtonCard
            currentChunks={currentChunks ?? []}
            setIsAddingNew={(isAdding) => {
              handleCancel();
              setIsAddingNew(isAdding);
            }}
          />
        )}

        {isAddingNew && (
          <AddChunkCard
            newChunkDetails={newChunkDetails}
            setNewChunkDetails={setNewChunkDetails}
            handleAddNewChunk={handleAddNewChunk}
            handleCancel={handleCancel}
            validating={isValidating}
          />
        )}
      </motion.div>
    </>
  );
}
