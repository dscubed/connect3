import { Trash } from "lucide-react";
import { ChunkEditor } from "../ChunkEditor";
import { useChunkContext } from "../../hooks/ChunkProvider";
import { AllCategories, ChunkEntry } from "../../ChunkUtils";
import { Fade } from "@/components/ui/Fade";
import { SortableChunk } from "./SortableChunk";

export function ChunkItem({
  chunk,
  category,
}: {
  chunk: ChunkEntry;
  category: AllCategories;
}) {
  const {
    removeChunk,
    isEditing,
    isEditingCategory,
    focusChunk,
    isFocused,
    getChunk,
    updateChunk,
  } = useChunkContext();

  const currentChunk = getChunk(chunk.id);
  if (!currentChunk) {
    return null;
  }

  return (
    <li
      onClick={() => {
        if (isEditing && isEditingCategory(category)) {
          focusChunk(chunk.id, category);
        }
      }}
    >
      <SortableChunk
        key={chunk.id}
        chunk={chunk}
        show={isEditing && isEditingCategory(category)}
      >
        {isFocused(chunk.id, category) ? (
          <ChunkEditor
            chunk={currentChunk}
            setChunk={(updatedChunk) => updateChunk(updatedChunk)}
          />
        ) : (
          <div className="flex items-baseline gap-2 rounded-lg w-full hover:bg-white/20 transition-all">
            <span
              className="inline-block w-2 h-2 bg-black rounded-full"
              aria-hidden="true"
            />
            <span className="flex-1 p-1 text-lg">{chunk.text}</span>
            <Fade
              show={isEditing && isEditingCategory(category)}
              className="p-1 text-muted hover:text-red-500 transition-colors"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeChunk(chunk.id);
                }}
                aria-label="Delete chunk"
              >
                <Trash className="h-4 w-4" />
              </button>
            </Fade>
          </div>
        )}
      </SortableChunk>
    </li>
  );
}
