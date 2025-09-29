import { Chunk } from "./ChunkUtils";

export function handleKeyDown(
  handleAddNewChunk: () => void,
  handleCancel: () => void
) {
  return function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddNewChunk();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };
}

export function handleCategoryChange(
  setNewChunkDetails: React.Dispatch<React.SetStateAction<Chunk | null>>
) {
  return function handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewChunkDetails((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        category: e.target.value.slice(0, 50),
      };
    });
  };
}

export function handleContentChange(
  setNewChunkDetails: React.Dispatch<React.SetStateAction<Chunk | null>>
) {
  return function handleContentChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setNewChunkDetails((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        content: e.target.value,
      };
    });
  };
}
