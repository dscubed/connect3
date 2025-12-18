import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDnd } from "../../hooks/useDnD";
import { AllCategories, ChunkInput } from "../../ChunkUtils";
import { ChunkEntry } from "../../hooks/ChunkProvider";
import { ChunkItem } from "../chunks/ChunkItem";
import { ChunkEditor } from "../ChunkEditor";
import { Fade } from "@/components/ui/Fade";

interface CategoryChunksProps {
  chunks: ChunkEntry[];
  newChunks: Record<AllCategories, ChunkInput>;
  setNewChunks: React.Dispatch<
    React.SetStateAction<Record<AllCategories, ChunkInput>>
  >;
  category: AllCategories;
}

export function CategoryChunks({
  chunks,
  category,
  newChunks,
  setNewChunks,
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
          <>
            {chunks.map((chunk) => (
              <ChunkItem key={chunk.id} chunk={chunk} category={category} />
            ))}
          </>
        </SortableContext>
      </DndContext>
      <li>
        <Fade show={newChunks[category] !== undefined} className="w-full">
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
        </Fade>
      </li>
    </ul>
  );
}
