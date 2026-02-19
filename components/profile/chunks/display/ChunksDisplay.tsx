import { useChunkContext } from "../hooks/ChunkProvider";
import { useDnd } from "../hooks/useDnD";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CategoryItem } from "./category/CategoryItem";
import { AddCategoryButton } from "../AddCategoryButton";
import { ChunksSkeleton } from "./ChunksSkeleton";

export function ChunksDisplay() {
  const { orderedCategoryChunks, loadingChunks, isEditing } = useChunkContext();
  const { handleCategoryDragEnd, sensors, categoryIds } = useDnd();

  // Replace entire chunk UI with skeleton while loading - no overlay
  if (loadingChunks) {
    return <ChunksSkeleton />;
  }

  return (
    <div
      className={`flex flex-col gap-4 min-h-32 items-center w-full ${
        !isEditing ? "justify-start" : "justify-center"
      }`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext
          items={categoryIds}
          strategy={verticalListSortingStrategy}
        >
          {orderedCategoryChunks.map(({ category, chunks }, index) => (
            <CategoryItem key={index} category={category} chunks={chunks} />
          ))}
        </SortableContext>
      </DndContext>
      {isEditing && (
        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <AddCategoryButton />
        </div>
      )}
    </div>
  );
}
