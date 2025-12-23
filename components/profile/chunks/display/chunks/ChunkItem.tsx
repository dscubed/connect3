import { Trash } from "lucide-react";
import { ChunkEditor } from "../ChunkEditor";
import { ChunkEntry, useChunkContext } from "../../hooks/ChunkProvider";
import { AllCategories } from "../../ChunkUtils";
import { Fade } from "@/components/ui/Fade";
import { SortableChunk } from "./SortableChunk";

export function ChunkItem({
  chunk,
  category,
}: {
  chunk: ChunkEntry;
  category: AllCategories;
}) {
  const { removeChunk, editChunks, setEditChunks, isEditing } =
    useChunkContext();

  return (
    <li
      onClick={() => {
        setEditChunks((prev) => {
          if (!isEditing || editChunks[chunk.id]) return prev;
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
            setTimeout(() => {
              setEditChunks((prev) => {
                const updated = { ...prev };
                delete updated[chunk.id];
                return updated;
              });
            }, 0)
          }
          chunkId={chunk.id}
        />
      ) : (
        <SortableChunk key={chunk.id} chunk={chunk} show={isEditing}>
          <div className="flex items-baseline gap-2 rounded-lg w-full hover:bg-white/20 transition-all">
            <span
              className="inline-block w-2 h-2 bg-black rounded-full"
              aria-hidden="true"
            />
            <span className="flex-1 p-2 text-base">{chunk.text}</span>
            <Fade
              show={isEditing}
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
        </SortableChunk>
      )}
    </li>
  );
}
