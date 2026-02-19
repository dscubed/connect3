import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDnd } from "../../hooks/useDnD";
import { AllCategories } from "../../ChunkUtils";
import { ChunkEntry } from "../../ChunkUtils";
import { ChunkItem } from "../chunks/ChunkItem";

interface CategoryChunksProps {
  chunks: ChunkEntry[];
  category: AllCategories;
}

export function CategoryChunks({ chunks, category }: CategoryChunksProps) {
  const { sensors, handleChunkDragEnd } = useDnd();
  return (
    <ul className="w-full flex flex-col gap-2">
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
    </ul>
  );
}
