import { Trash } from "lucide-react";
import { ChunkEditor } from "./ChunkEditor";
import { ChunkEntry, useChunkContext } from "./hooks/ChunkProvider";
import { AllCategories, ChunkInput } from "./ChunkUtils";
import { Dispatch, SetStateAction } from "react";

export function ChunkItem({
  chunk,
  category,
  isEditing,
  editChunks,
  setEditChunks,
}: {
  chunk: ChunkEntry;
  category: AllCategories;
  isEditing: boolean;
  editChunks: Record<string, ChunkInput>;
  setEditChunks: Dispatch<SetStateAction<Record<string, ChunkInput>>>;
}) {
  const { removeChunk } = useChunkContext();
  return (
    <li
      onClick={() => {
        setEditChunks((prev) => {
          if (!isEditing) return prev;
          return {
            ...prev,
            [chunk.id]: { text: chunk.text, category },
          };
        });
      }}
    >
      {editChunks[chunk.id] ? (
        <ChunkEditor
          chunk={editChunks[chunk.id]}
          setChunk={(updatedChunk) =>
            setEditChunks((prev) => ({
              ...prev,
              [chunk.id]: updatedChunk,
            }))
          }
          cancel={() =>
            setEditChunks((prev) => {
              const updated = { ...prev };
              delete updated[chunk.id];
              return updated;
            })
          }
          chunkId={chunk.id}
        />
      ) : (
        <div className="flex items-baseline gap-2 rounded-lg w-full hover:bg-white/20">
          <span
            className="inline-block w-2 h-2 bg-white rounded-full"
            aria-hidden="true"
          />
          <span className="flex-1 p-2 text-base">{chunk.text}</span>
          {isEditing && (
            <button
              type="button"
              className="p-1 text-white/70 hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("Removing chunk", chunk.id);
                removeChunk(chunk.id);
              }}
              aria-label="Delete chunk"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </li>
  );
}
