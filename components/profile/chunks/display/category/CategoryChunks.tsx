import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDnd } from "./hooks/useDnD";
import { AllCategories, ChunkInput } from "./ChunkUtils";
import { ChunkEntry } from "./hooks/ChunkProvider";
import { ChunkItem } from "./display/ChunkItem";
import { ChunkEditor } from "../ChunkEditor";
import { SortableChunk } from "./SortableChunk";

interface CategoryChunksProps {
  chunks: ChunkEntry[];
  newChunks: Record<AllCategories, ChunkInput>;
  isEditing: boolean;
  setNewChunks: React.Dispatch<
    React.SetStateAction<Record<AllCategories, ChunkInput>>
  >;
  editChunks: Record<string, ChunkInput>;
  setEditChunks: React.Dispatch<
    React.SetStateAction<Record<string, ChunkInput>>
  >;
  category: AllCategories;
}

export function CategoryChunks({
  chunks,
  category,
  isEditing,
  newChunks,
  setNewChunks,
  editChunks,
  setEditChunks,
}: CategoryChunksProps) {
  const { sensors, handleChunkDragEnd } = useDnd();
  return (
    <ul className="space-y-2 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => handleChunkDragEnd(event, chunks, category)}
      >
        <SortableContext
          items={chunks.map((chunk) => chunk.id)}
          strategy={verticalListSortingStrategy}
        >
          {isEditing ? (
            <>
              {chunks.map((chunk) => (
                <SortableChunk key={chunk.id} chunk={chunk}>
                  <ChunkItem
                    chunk={chunk}
                    category={category}
                    isEditing={isEditing}
                    editChunks={editChunks}
                    setEditChunks={setEditChunks}
                  />
                </SortableChunk>
              ))}
            </>
          ) : (
            <>
              {chunks.map((chunk) => (
                <ChunkItem
                  key={chunk.id}
                  chunk={chunk}
                  category={category}
                  isEditing={isEditing}
                  editChunks={editChunks}
                  setEditChunks={setEditChunks}
                />
              ))}
            </>
          )}
        </SortableContext>
      </DndContext>
      {newChunks[category] && (
        <li>
          <ChunkEditor
            chunk={newChunks[category] || { text: "", category }}
            setChunk={(chunk) =>
              setNewChunks((prev) => ({
                ...prev,
                [category]: chunk,
              }))
            }
            cancel={() =>
              setNewChunks((prev) => {
                const updated = { ...prev };
                delete updated[category];
                return updated;
              })
            }
          />
        </li>
      )}
    </ul>
  );
}
