"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useUserChunks } from "@/components/profile/chunks/hooks/useUserChunks";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { AddChunkCard } from "./AddChunkCard";
import { ChunkCard } from "./ChunkCard";
import { ErrorState, LoadingState, EmptyState } from "./States";

interface ChunksSectionProps {
  userId?: string;
}

export interface Chunk {
  id: string;
  openai_file_id: string;
  summary_text: string;
  status: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

// Main Component
export default function ChunksSection({ userId }: ChunksSectionProps) {
  const { chunks, loading, error, refetch } = useUserChunks(userId);
  const [showAll, setShowAll] = useState(false);
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newChunkText, setNewChunkText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Computed values
  const displayedChunks = showAll ? chunks : chunks.slice(0, 2);
  const showAddCard = showAll || (chunks.length < 2 && chunks.length <= 10);
  const hasMoreChunks = chunks.length > 2;

  // Event handlers
  const handleDeleteChunk = async (chunkId: string) => {
    setIsDeleting(true);
    try {
      const response = await useAuthStore
        .getState()
        .makeAuthenticatedRequest(`/api/vector-store/deleteChunk/${chunkId}`, {
          method: "DELETE",
        });

      if (!response.ok) {
        throw new Error("Failed to delete chunk");
      }

      const result = await response.json();
      setIsDeleting(false);

      if (result.success) {
        refetch();
        toast.success("Chunk deleted successfully");
      } else {
        console.error("Delete failed:", result.error);
        toast.error(`Delete failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Error deleting chunk:", err);
      toast.error("Failed to delete chunk. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddChunk = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewChunkText("");
  };

  const handleUploadChunk = async () => {
    if (!newChunkText.trim() || !userId) return;

    setIsUploading(true);

    try {
      const response = await useAuthStore
        .getState()
        .makeAuthenticatedRequest("/api/vector-store/uploadChunk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            text: newChunkText.trim(),
          }),
        });

      const result = await response.json();

      if (result.success) {
        setNewChunkText("");
        setIsAdding(false);
        refetch();
        toast.success("Chunk uploaded successfully");
      } else {
        console.error("Upload failed:", result.error);
        toast.error(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Error uploading chunk:", err);
      toast.error("An unexpected error occurred while uploading");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleChunkExpansion = (chunkId: string) => {
    setExpandedChunk(expandedChunk === chunkId ? null : chunkId);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Render states
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (isDeleting) {
    return <LoadingState message="Deleting chunk..." />;
  }

  return (
    <motion.div
      className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Chunks</h2>
        <span className="text-white/60 text-sm">
          {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"}
        </span>
      </div>

      {/* Empty State */}
      {chunks.length === 0 && (
        <>
          <EmptyState />
          <AddChunkCard
            isAdding={isAdding}
            onAdd={handleAddChunk}
            onCancel={handleCancelAdd}
            onUpload={handleUploadChunk}
            newChunkText={newChunkText}
            setNewChunkText={setNewChunkText}
            isUploading={isUploading}
          />
        </>
      )}

      {/* Chunks List */}
      {chunks.length > 0 && (
        <div className="space-y-4">
          {displayedChunks.map((chunk, index) => (
            <ChunkCard
              key={chunk.id}
              chunk={chunk}
              index={index}
              expandedChunk={expandedChunk}
              onToggleExpansion={toggleChunkExpansion}
              onDelete={handleDeleteChunk}
              formatDate={formatDate}
              truncateContent={truncateContent}
            />
          ))}

          {/* Add New Chunk Card */}
          {showAddCard && (
            <AddChunkCard
              isAdding={isAdding}
              onAdd={handleAddChunk}
              onCancel={handleCancelAdd}
              onUpload={handleUploadChunk}
              newChunkText={newChunkText}
              setNewChunkText={setNewChunkText}
              isUploading={isUploading}
            />
          )}
        </div>
      )}

      {/* Show More/Less Button */}
      {hasMoreChunks && (
        <motion.button
          onClick={toggleShowAll}
          className="w-full mt-4 py-2 px-4 border border-white/20 rounded-xl text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showAll ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show {chunks.length - 2} More <ChevronDown className="h-4 w-4" />
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
