import { Trash } from "lucide-react";
import { ChunkEditor } from "../ChunkEditor";
import { useChunkContext } from "../../hooks/ChunkProvider";
import { AllCategories, ChunkEntry } from "../../ChunkUtils";
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
    editCategory,
  } = useChunkContext();

  const currentChunk = getChunk(chunk.id);
  if (!currentChunk) {
    return null;
  }

  return (
    <li
      onClick={() => {
        if (!isEditing) return;
        if (isEditingCategory(category)) {
          focusChunk(chunk.id, category);
        } else {
          editCategory(category);
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
          <div className="flex items-center gap-3 rounded-lg w-full hover:bg-white/20 transition-all">
            <span
              className="inline-flex w-4 shrink-0 justify-center"
              aria-hidden="true"
            >
              <span className="w-2 h-2 rounded-full bg-black" />
            </span>
            <span className="flex-1 min-w-0 text-base leading-relaxed">{chunk.text}</span>
            {isEditing && isEditingCategory(category) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeChunk(chunk.id);
                }}
                aria-label="Delete chunk"
                className="shrink-0 rounded-full border border-muted/50 p-1.5 text-muted hover:text-red-500 hover:border-red-500/50 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </SortableChunk>
    </li>
  );
}
