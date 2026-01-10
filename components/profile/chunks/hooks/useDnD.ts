import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AllCategories } from "../ChunkUtils";
import { ChunkEntry, useChunkContext } from "./ChunkProvider";

export function useDnd() {
  const { moveCategory, orderedCategoryChunks, moveChunk } = useChunkContext();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // drag only after moving 5px to avoid accidental drags
      },
    })
  );

  const categoryIds = orderedCategoryChunks.map((cat) => cat.category);

  // handle drag end for chunks within a category
  const handleChunkDragEnd = (
    event: DragEndEvent,
    chunks: ChunkEntry[],
    category: AllCategories
  ) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chunks.findIndex((c) => c.id === active.id);
      const newIndex = chunks.findIndex((c) => c.id === over.id);
      moveChunk(category, oldIndex, newIndex);
    }
  };

  // handle drag end for categories
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categoryIds.indexOf(active.id as AllCategories);
      const newIndex = categoryIds.indexOf(over.id as AllCategories);
      moveCategory(oldIndex, newIndex);
    }
  };

  return { handleCategoryDragEnd, handleChunkDragEnd, sensors, categoryIds };
}
