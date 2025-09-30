import { motion } from "framer-motion";
import { Plus, Trash, Loader2, Eye, EyeOff } from "lucide-react";
import { useProfileChunkStore } from "@/stores/profiles/profileChunkStore";
import type { ChunkData } from "../ChunkUtils";
import { AddInput } from "./AddInput";
import { CubeLoader } from "@/components/ui/CubeLoader";

interface ChunkListProps {
  category: string;
  chunks: ChunkData[];
}

export function ChunkList({ category, chunks }: ChunkListProps) {
  const addingChunks = useProfileChunkStore((s) => s.addingChunks);
  const setAddingChunks = useProfileChunkStore((s) => s.setAddingChunks);
  const deleting = useProfileChunkStore((s) => s.deleting);

  const addingChunk = !!addingChunks[category];
  const inputValue = addingChunks[category]?.text ?? "";
  const isAdding = addingChunks[category]?.loading ?? false;

  const addChunk = useProfileChunkStore((s) => s.addChunk);
  const deleteChunk = useProfileChunkStore((s) => s.deleteChunk);

  const handleAddClick = () => {
    setAddingChunks({
      ...addingChunks,
      [category]: { text: "", loading: false },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddingChunks({
      ...addingChunks,
      [category]: {
        ...addingChunks[category],
        text: e.target.value,
      },
    });
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    setAddingChunks({
      ...addingChunks,
      [category]: {
        ...addingChunks[category],
        loading: true,
      },
    });
    await addChunk({
      category,
      summary_text: inputValue.trim(),
    });
    // loading state will be cleared in addChunk after upload
  };

  const handleDelete = (chunkId: string) => async () => {
    await deleteChunk(chunkId);
  };

  const handleCancel = () => {
    const next = { ...addingChunks };
    delete next[category];
    setAddingChunks(next);
  };

  const handleVisibilityToggle = (chunk: ChunkData) => async () => {
    await useProfileChunkStore.getState().updateChunk(chunk.id, {
      visible: !chunk.visible,
    });
  };

  return (
    <motion.div
      initial={false}
      animate={{
        height: "auto",
        opacity: 1,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="pt-4 space-y-4">
        {chunks
          .filter((chunk) => chunk.status === "completed")
          .map((chunk, index) => (
            <motion.div
              key={chunk.id}
              className="pl-6 border-l-2 border-white/10 hover:border-gray-200/30 text-white/70 leading-relaxed group-hover/chunk:text-white/90 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex justify-between w-full gap-x-2">
                <span className="flex-1">{chunk.summary_text}</span>
                <div onClick={handleVisibilityToggle(chunk)} className="ml-2">
                  {chunk.visible ? (
                    <Eye className="w-4 h-4 hover:text-gray-300" />
                  ) : (
                    <EyeOff className="w-4 h-4 hover:text-gray-300" />
                  )}
                </div>

                {(deleting[chunk.id] && (
                  <Loader2 className="animate-spin w-4 h-4" />
                )) || (
                  <Trash
                    onClick={handleDelete(chunk.id)}
                    className="w-4 h-4 hover:text-red-500 ml-2"
                  />
                )}
              </div>
            </motion.div>
          ))}
        {addingChunk ? (
          isAdding ? (
            <div className="flex flex-col items-center justify-center h-32">
              <CubeLoader size={40} />
              <span className="text-white/70">Adding chunk...</span>
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-2 pl-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: chunks.length * 0.05 }}
            >
              <AddInput
                value={inputValue}
                onChange={handleInputChange}
                onSave={handleSubmit}
                onCancel={handleCancel}
                disabled={isAdding}
              />
            </motion.div>
          )
        ) : (
          <motion.p
            className="flex items-center gap-2 pl-6 border-l-2 border-white/10 hover:border-gray-200/30 text-white/70 leading-relaxed group-hover/chunk:text-white/90 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: chunks.length * 0.05 }}
            onClick={handleAddClick}
          >
            <Plus className="w-4 h-4" /> Add Chunk
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
