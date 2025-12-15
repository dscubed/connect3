import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useProfileChunkStore } from "@/stores/profiles/profileChunkStore";
import { AddInput } from "./AddInput";
import { CubeLoader } from "@/components/ui/CubeLoader";

export function AddCategoryButton() {
  const [adding, setAdding] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [chunkInput, setChunkInput] = useState("");
  const addCategory = useProfileChunkStore((s) => s.addCategory);
  const addingCategory = useProfileChunkStore((s) => s.addingCategory);

  const handleAddClick = () => setAdding(true);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryInput(e.target.value);
  };

  const handleChunkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChunkInput(e.target.value);
  };

  const handleSubmit = async () => {
    if (!categoryInput.trim() || !chunkInput.trim()) return;
    await addCategory(categoryInput.trim(), chunkInput.trim());
    setCategoryInput("");
    setChunkInput("");
    setAdding(false);
  };

  const handleCancel = () => {
    setCategoryInput("");
    setChunkInput("");
    setAdding(false);
  };

  if (addingCategory.loading)
    return (
      <div className="flex flex-col items-center justify-center h-32">
        <CubeLoader size={40} />
        <span className="text-muted">Adding category...</span>
      </div>
    );

  return (
    <motion.div
      className={`w-full py-2 ${
        !adding ? "hover:bg-white/5" : ""
      } transition-all rounded-lg group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      {adding ? (
        <div className="flex flex-col gap-2 w-full">
          <input
            value={categoryInput}
            onChange={handleCategoryChange}
            className="flex-1 px-3 py-2 rounded bg-white/10"
            placeholder="Category name..."
            disabled={addingCategory?.loading}
          />
          <AddInput
            value={chunkInput}
            onChange={handleChunkChange}
            onSave={handleSubmit}
            onCancel={handleCancel}
            disabled={addingCategory?.loading}
          />
        </div>
      ) : (
        <button
          onClick={handleAddClick}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">Add Category</h3>
            <span className="text-sm text-muted bg-white/10 px-3 py-1 rounded-full">
              <Plus className="h-5 w-5 text-muted group-hover:text-black/80 transition-colors" />
            </span>
          </div>
        </button>
      )}
    </motion.div>
  );
}
